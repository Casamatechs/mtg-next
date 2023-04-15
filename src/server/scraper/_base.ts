import { Card } from "../../utils/types";

export default interface Scraper {
    readonly BASE_URL: string;
    readonly BASE_SEARCH_URL: string;
    searchCardPrices(cardName: string): Promise<Card[]>;
}