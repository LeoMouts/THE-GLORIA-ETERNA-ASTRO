import raw from "./data/market.json";
import type { MarketPlayer } from "./types";

export const GLOBAL_MARKET = raw as unknown as MarketPlayer[];
