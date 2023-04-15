export interface Card {
    readonly id: string;
    name: string;
    lang: string;
    cond: string;
    store: string | 'Kindle';
    price: number;
    stock: number;
    foil: boolean;
    set?: string;
    imgUrl: string;
}