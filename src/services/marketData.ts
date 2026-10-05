import { CandleData, OrderBookLevel, RecentTrade, TimeFrame } from "../types";

export interface StreamCallbacks {
  onCandleUpdate: (candle: CandleData, isClosed: boolean) => void;
  onTrade?: (trade: RecentTrade) => void;
  onOrderBook?: (bids: OrderBookLevel[], asks: OrderBookLevel[]) => void;
}

export function sanitizeCandles(candles: CandleData[]): CandleData[] {
  if (!candles || candles.length === 0) return [];
  const sorted = [...candles].sort((a, b) => Number(a.time) - Number(b.time));
  const clean: CandleData[] = [];
  for (const c of sorted) {
    if (clean.length === 0) {
      clean.push(c);
    } else {
      const prevTime = Number(clean[clean.length - 1].time);
      const curTime = Number(c.time);
      if (curTime > prevTime) {
        clean.push(c);
      } else if (curTime === prevTime) {
        // Replace previous with newer candle data
        clean[clean.length - 1] = c;
      }
    }
  }
  return clean;
}

export async function fetchHistoricalKlines(
  symbol: string,
  interval: TimeFrame,
  limit: number = 300
): Promise<CandleData[]> {
  const apiInterval = interval === "1s" ? "1m" : interval;
  const candidateUrls = [
    `/api/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${apiInterval}&limit=${limit}`,
    `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${apiInterval}&limit=${limit}`,
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : json.data;
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped = rawList.map((item: any[]) => ({
            time: Math.floor(Number(item[0]) / 1000), // convert to seconds for lightweight-charts
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
            volume: parseFloat(item[5]),
          }));
          return sanitizeCandles(mapped);
        }
      }
    } catch (err) {
      // Continue to next endpoint fallback
    }
  }

  // Pure local fallback if server unreachable
  const step = interval === "1s" ? 1 : interval === "1m" ? 60 : interval === "5m" ? 300 : interval === "15m" ? 900 : interval === "1h" ? 3600 : 86400;
  const now = Math.floor(Date.now() / 1000);
  const baseTime = Math.floor(now / step) * step;
  let price = symbol.includes("BTC") ? 94200 : symbol.includes("ETH") ? 2740 : 195;
  const list: CandleData[] = [];

  for (let i = limit - 1; i >= 0; i--) {
    const time = baseTime - i * step;
    const delta = (Math.random() - 0.49) * (price * 0.003);
    const open = price;
    const close = price + delta;
    const high = Math.max(open, close) + Math.random() * (price * 0.002);
    const low = Math.min(open, close) - Math.random() * (price * 0.002);
    const volume = Math.random() * 50 + 10;
    list.push({ time, open, high, low, close, volume });
    price = close;
  }
  return sanitizeCandles(list);
}

export class LiveMarketStream {
  private ws: WebSocket | null = null;
  private timer: any = null;
  private currentCandle: CandleData | null = null;
  private symbol: string;
  private interval: TimeFrame;
  private callbacks: StreamCallbacks;
  private isDestroyed: boolean = false;
  private isEcoMode: boolean = false;
  private isPaused: boolean = false;
  private visibilityHandler: (() => void) | null = null;

  constructor(symbol: string, interval: TimeFrame, callbacks: StreamCallbacks, isEcoMode: boolean = false) {
    this.symbol = symbol;
    this.interval = interval;
    this.callbacks = callbacks;
    this.isEcoMode = isEcoMode;
  }

  public setInitialCandle(candle: CandleData) {
    this.currentCandle = { ...candle };
  }

  public setEcoMode(enabled: boolean) {
    this.isEcoMode = enabled;
    if (!this.isPaused && !this.isDestroyed) {
      this.startSyntheticTickFallback();
    }
  }

  public start() {
    this.isDestroyed = false;
    this.isPaused = false;
    this.connectWebSocket();
    this.startSyntheticTickFallback();

    // Mobile Battery Protection: Pause completely when screen is off or app is in background
    if (typeof document !== "undefined") {
      this.visibilityHandler = () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }
  }

  public pause() {
    this.isPaused = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public resume() {
    if (this.isDestroyed) return;
    this.isPaused = false;
    this.startSyntheticTickFallback();
  }

  private connectWebSocket() {
    try {
      const sym = this.symbol.toLowerCase();
      // Binance kline websocket (uses 1m if interval is 1s)
      const wsInterval = this.interval === "1s" ? "1m" : this.interval;
      const wsUrl = `wss://stream.binance.com:9443/ws/${sym}@kline_${wsInterval}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onmessage = (event) => {
        if (this.isDestroyed) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.e === "kline" && msg.k) {
            const k = msg.k;
            const updatedCandle: CandleData = {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            };
            this.currentCandle = updatedCandle;
            this.callbacks.onCandleUpdate(updatedCandle, k.x);

            // Generate trade tape item
            if (this.callbacks.onTrade) {
              const side = updatedCandle.close >= updatedCandle.open ? "buy" : "sell";
              this.callbacks.onTrade({
                id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                price: updatedCandle.close,
                amount: Number((Math.random() * 1.5 + 0.05).toFixed(4)),
                side,
                time: new Date().toLocaleTimeString(),
              });
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      };

      this.ws.onerror = () => {
        // Fallback handles it smoothly
      };

      this.ws.onclose = () => {
        if (!this.isDestroyed) {
          // Attempt reconnection after 5s
          setTimeout(() => {
            if (!this.isDestroyed) this.connectWebSocket();
          }, 5000);
        }
      };
    } catch (err) {
      // Stream fallback keeps functioning
    }
  }

  // Smooth micro-tick generator: respects EcoMode to save battery
  private startSyntheticTickFallback() {
    if (this.timer) clearInterval(this.timer);

    const intervalMs = this.isEcoMode ? 1500 : 450;

    this.timer = setInterval(() => {
      if (this.isDestroyed || this.isPaused || !this.currentCandle) return;

      const volatility = this.currentCandle.close * 0.00025;
      const tickDelta = (Math.random() - 0.495) * volatility;
      const newClose = Number((this.currentCandle.close + tickDelta).toFixed(2));
      const newHigh = Math.max(this.currentCandle.high, newClose);
      const newLow = Math.min(this.currentCandle.low, newClose);
      const newVol = Number((this.currentCandle.volume + Math.random() * 0.08).toFixed(4));

      const updated: CandleData = {
        ...this.currentCandle,
        high: newHigh,
        low: newLow,
        close: newClose,
        volume: newVol,
      };

      this.currentCandle = updated;
      this.callbacks.onCandleUpdate(updated, false);

      // Generate orderbook levels at reduced rate in eco mode
      const obThreshold = this.isEcoMode ? 0.7 : 0.4;
      if (this.callbacks.onOrderBook && Math.random() > obThreshold) {
        const bids: OrderBookLevel[] = [];
        const asks: OrderBookLevel[] = [];
        let cumBid = 0;
        let cumAsk = 0;

        for (let i = 1; i <= 6; i++) {
          const bPrice = Number((newClose - i * (newClose * 0.0003)).toFixed(2));
          const bAmt = Number((Math.random() * 2.8 + 0.2).toFixed(3));
          cumBid += bAmt;
          bids.push({ price: bPrice, amount: bAmt, total: Number(cumBid.toFixed(3)) });

          const aPrice = Number((newClose + i * (newClose * 0.0003)).toFixed(2));
          const aAmt = Number((Math.random() * 2.8 + 0.2).toFixed(3));
          cumAsk += aAmt;
          asks.push({ price: aPrice, amount: aAmt, total: Number(cumAsk.toFixed(3)) });
        }
        this.callbacks.onOrderBook(bids, asks);
      }
    }, intervalMs);
  }

  public stop() {
    this.isDestroyed = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
