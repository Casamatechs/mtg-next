import Scraper from "./_base";
import { v4 as uuidv4} from 'uuid';
import { JSDOM } from 'jsdom';
import { Card } from "../../utils/types";

class Openbinder implements Scraper {

    private static _instance: Openbinder;

    private constructor() {

    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    BASE_URL = 'https://openbinder.co.kr/';
    BASE_SEARCH_URL = 'https://openbinder.co.kr/index.php?page=search&cname=';

    private FLAGS: { [id: string]: string } = {
        'flag/Nx20xen.png.pagespeed.ic.9nFGTBPnvk.png': 'ENG',
        'flag/Nx20xko.png.pagespeed.ic.SQ6MPfgFC-.png': 'KR',
        'flag/Nx20xja.png.pagespeed.ic.e0vM4KWyoN.png': 'JP',
        './flag/jp.png': 'JP',
        'flag/Nx20xge.png.pagespeed.ic.raJ410vWQh.png': 'GER',
        'flag/Nx20xru.png.pagespeed.ic.fJ-01jLnWY.png': 'RU',
        './flag/ru.png': 'RU',
        'flag/Nx20xit.png.pagespeed.ic.cFFE78eSEJ.png': 'ITA'
    };

    private CONDITION: { [id: string]: string } = {
        'image/xNM.png.pagespeed.ic.wb3yXzgE3v.png': 'NM',
        'image/NM.png': 'NM',
        'image/xEX.png.pagespeed.ic.7hqskDn8dg.png': 'EX',
        'image/EX.png': 'EX',
        'image/xVG.png.pagespeed.ic.WO_VI12K7S.png': 'VG',
        'image/VG.png': 'VG',
        'image/xG.png.pagespeed.ic.EuAcxfDloy.png': 'G',
        'image/G.png': 'G'
    };

    public async searchCardPrices(cardName: string): Promise<Card[]> {
        const url = this.BASE_SEARCH_URL + cardName
        const compiledPromise = this.fetchURL(url)
            .then(document => document.querySelectorAll('div.dark__bg-dark')
                .item(0).parentElement?.attributes
                .getNamedItem('onclick')?.textContent?.split('"')[1])
            .then(cardUrl => this.fetchURL(this.BASE_URL + cardUrl))
            .then(document => {
                const cards: Promise<Card[]>[] = [];
                document.querySelector('div.cardsets')?.querySelectorAll('tr').forEach(element => {
                    if (element.innerHTML?.includes('등록수') && !element.innerHTML?.includes('class="othersets"')) {
                        const cardHref = element.querySelector('a')?.attributes.getNamedItem('href')?.textContent?.substring(2);
                        const set_id = element.querySelector('div[style="float:right;"')?.textContent;
                        cards.push(this.fetchCardInfo(this.BASE_URL + cardHref, cardName, set_id!));
                    }
                });
                return Promise.all(cards);
            })
            .then(cards => cards.reduce((arr, cardArray) => {
                arr.push(...cardArray);
                return arr;
            }, []))
        console.log('Building response. Please wait');
        return compiledPromise;
    }

    private async fetchURL(url: string): Promise<Document> {
        return fetch(url)
            .then(value => value.text())
            .then(dom => new JSDOM(dom).window.document)
            .catch(err => {
                console.error(err);
                throw new Error(err);
            });
    }

    private async fetchCardInfo(url: string, name: string, set_id: string): Promise<Card[]> {
        return this.fetchURL(url)
            .then(document => {
                const cards: Card[] = [];
                const imgUrl = document.querySelector('img.cardimageinfo')?.attributes.getNamedItem('src')?.textContent!;
                document.querySelector('div[id="tab-normal"')?.querySelectorAll('div.card-body').forEach(div => {
                    if (div.querySelector('p')?.textContent === '판매자의 설정에 문제가 있습니다. 판매자에게 문의하십시오.') return;
                    const images = div.querySelectorAll('img');
                    const lang = this.FLAGS[images.item(1).attributes.getNamedItem('src')?.textContent!]!;
                    const condition = this.CONDITION[images.item(2).attributes.getNamedItem('src')?.textContent!]!;
                    const storeName = div.querySelector('a')?.textContent!;
                    const price = +div.querySelector('p')?.textContent?.split(' (')[0]?.replace(/[^0-9]/g, '')!;
                    const stock = +div.querySelector('p')?.textContent?.split(' (')[1]?.replace(/^\D+/g, '').split('장')[0]!;
                    cards.push({
                        id: uuidv4(),
                        name: name,
                        cond: condition,
                        foil: false,
                        imgUrl: imgUrl,
                        lang: lang,
                        store: storeName,
                        price: price,
                        stock: stock,
                        set: set_id
                    })
                });
                document.querySelector('div[id="tab-foil"')?.querySelectorAll('div.card-body').forEach(div => {
                    if (div.querySelector('p')?.textContent === '판매자의 설정에 문제가 있습니다. 판매자에게 문의하십시오.') return;
                    const images = div.querySelectorAll('img');
                    const lang = this.FLAGS[images.item(1).attributes.getNamedItem('src')?.textContent!]!;
                    const condition = this.CONDITION[images.item(2).attributes.getNamedItem('src')?.textContent!]!;
                    const storeName = div.querySelector('a')?.textContent!;
                    const price = +div.querySelector('p')?.textContent?.split(' (')[0]?.replace(/[^0-9]/g, '')!;
                    const stock = +div.querySelector('p')?.textContent?.split(' (')[1]?.replace(/^\D+/g, '').split('장')[0]!;
                    cards.push({
                        id: uuidv4(),
                        name: name,
                        cond: condition,
                        foil: true,
                        imgUrl: imgUrl,
                        lang: lang,
                        store: storeName,
                        price: price,
                        stock: stock,
                        set: set_id
                    })
                })
                return cards;
            })
    }

}

export const openbinderScraper = Openbinder.Instance;