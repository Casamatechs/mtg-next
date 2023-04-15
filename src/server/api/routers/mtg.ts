import { z } from 'zod';
import { kindleScrapper } from '../../scraper/kindle';
import { openbinderScraper } from '../../scraper/openbinder';
import { createTRPCRouter, publicProcedure } from "../trpc";

export const mtgRouter = createTRPCRouter({
    findAllStock: publicProcedure
        .input(z.string().min(1))
        .query(async ({input}) => {
            const kindleStock =  kindleScrapper.searchCardPrices(input)
            const openbinderStock = openbinderScraper.searchCardPrices(input)
            return await Promise.all([kindleStock, openbinderStock]).then(c => c.flat())
        })
})