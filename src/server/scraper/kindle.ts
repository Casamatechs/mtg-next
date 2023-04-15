import { JSDOM } from 'jsdom';
import { v4 as uuidv4} from 'uuid';
import { Card } from '../../utils/types';
import Scraper from './_base';



class Kindle implements Scraper {

    private static _instance: Kindle;

    private constructor() {

    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }
    
    BASE_URL = 'http://www.mtgkindleshop.com';
    BASE_SEARCH_URL = 'http://www.mtgkindleshop.com/kindle/search_result.php';

    public searchCardPrices(cardName: string): Promise<Card[]> {
        const data = new URLSearchParams({
            'search': cardName,
            'limit': '200',
            'offset': '0',
            'ko': '1',
            'foilcard': '',
            'reset': 'ok'
        });
        const compiledPromise = fetch(this.BASE_SEARCH_URL, {
            method: 'POST',
            body: data
        }).then(value => value.text())
        .then(dom => new JSDOM(dom).window.document)
        .then(document => {
            let cID = 1001;
            const cards: Card[] = [];
            document.querySelectorAll('div[id="cardStyle"]').forEach(div => {
                const scrapedName = div.querySelector('[id="enName"]')?.textContent!;
                if (scrapedName.includes('Art Series') || !scrapedName.includes(cardName)) {
                    cID += 1001;
                    return;
                }
                const imgURL = div.querySelector('img')?.attributes.getNamedItem('src')?.textContent?.replace('..',this.BASE_URL).replace(' ','%20')!;
                const stockDiv = div.querySelector(`[id="${cID}"]`);
                const priceDiv = div.querySelector('[id="kindlePrice"');
                // Normal stock
                const normalStock = +stockDiv?.querySelectorAll('p').item(0).textContent?.split(' / ')[0]?.replace(/[^0-9]+/g,'')!
                const normalPrice = +priceDiv?.querySelectorAll('p[id="kindlePriceMax"]').item(0).textContent?.replace(/[^0-9]+/g,'')!
                cards.push({
                    id: uuidv4(),
                    name: scrapedName,
                    cond: 'NM',
                    foil: false,
                    imgUrl: imgURL,
                    lang: 'ENG',
                    price: normalPrice,
                    stock: normalStock,
                    store: 'Kindle'
                })
                // Foil stock
                const foilStock = +stockDiv?.querySelectorAll('p').item(1).textContent?.split(' / ')[0]?.replace(/[^0-9]+/g,'')!
                const foilPrice = +priceDiv?.querySelectorAll('p[id="kindlePriceMax"]').item(1).textContent?.replace(/[^0-9]+/g,'')!
                cards.push({
                    id: uuidv4(),
                    name: scrapedName,
                    cond: 'NM',
                    foil: true,
                    imgUrl: imgURL,
                    lang: 'ENG',
                    price: foilPrice,
                    stock: foilStock,
                    store: 'Kindle'
                })
                cID += 1001;
            })
            return cards.filter(card => card.stock > 0);
        })
        return compiledPromise;
    }
}

export const kindleScrapper = Kindle.Instance;