const puppeteer = require('puppeteer');
const {toUTCString} = require('../utils/common.utils');

class Codechef {
    constructor(pageCount = 5) {
        this.baseURL = "https://www.codechef.com/contests";
        this.pageCount = pageCount;
        this.browser = null;
        this.page = null;
        this.contests = [];
        // this.init();
    }

    async waitForXPath(page, xpath, timeout = 30000) {
        try {
            await page.waitForFunction(
                (xpath) => !!document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,
                { timeout },
                xpath
            );
            console.log(`XPath found: ${xpath}`);
        } catch (error) {
            console.error(`Failed to find XPath: ${xpath}`);
            throw error;
        }
    }

    // Fallback delay function
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async init() {
        const contests = await this.fetchContestPages();
        console.log('Final Contest List:', contests);
        this.contests.push(...contests);
        if (this.browser) await this.browser.close();
    }

    async fetchContestPages() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        const allContests = [];

        try {
            await this.page.goto(this.baseURL, { waitUntil: 'networkidle2', timeout: 30000 });
            const upcomingXPath = '//*[@id="root"]/div/div[3]/div/div/div[2]/div[1]/div[2]/div/div[2]/table/tbody';
            const pastXPath = '//*[@id="root"]/div/div[3]/div/div/div[2]/div[3]/div[2]/div/div[2]/table/tbody';

            this.page.on('console', msg => console.log('Browser Console:', msg.text()));

            console.log('Initial URL:', await this.page.url());
            console.log('Waiting 4 seconds for tables to load...');
            await this.delay(4000); // Use fallback delay instead of waitForTimeout

            // Scrape upcoming contests
            console.log('Waiting for upcoming contests table...');
            await this.waitForXPath(this.page, upcomingXPath);
            const upcomingContests = await this.scrapeContestList(upcomingXPath, 'Upcoming');
            allContests.push(...upcomingContests);

            // Scrape past contests with lazy loading
            console.log('Waiting for past contests table...');
            await this.waitForXPath(this.page, pastXPath);
            const pastContests = await this.scrapePastContestsWithLazyLoading(pastXPath);
            allContests.push(...pastContests);

            return allContests;
        } catch (error) {
            console.error('Error in fetchContestPages:', error.message);
            console.log('Page content:', await this.page.content());
            return allContests;
        } finally {
            if (this.browser) await this.browser.close();
        }
    }

    async scrapeContestList(tbodyXPath, type) {
        try {
            const contests = await this.page.evaluate((tbodyXPath) => {
                const tbody = document.evaluate(tbodyXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (!tbody) return [];

                const rows = tbody.querySelectorAll('tr');
                const contestList = [];

                for (let i = 0; i < rows.length; i++) {
                    const cells = rows[i].querySelectorAll('td');
                    if (cells.length < 3) continue;

                    const name = cells[1].textContent.replace(/\s+/g, ' ').trim(); // Col idx 1
                    const dateTime = cells[2].textContent.replace(/\s+/g, ' ').trim(); // Col idx 2

                    contestList.push({ name, dateTime });
                }

                return contestList;
            }, tbodyXPath);

            console.log(`Scraped ${type} CodeChef Contests W:`);
            contests.forEach(contest => {
                console.log(`Name: ${contest.name}, Date/Time: ${contest.dateTime}`);
            });

            return contests;
        } catch (error) {
            console.error(`Error in scrapeContestList (${type}):`, error.message);
            return [];
        }
    }

    async scrapePastContestsWithLazyLoading(tbodyXPath) {
        try {
            const contests = new Set();
            let previousRowCount = 0;
            let scrollAttempts = 0;

            while (scrollAttempts < this.pageCount) {
                const currentContests = await this.page.evaluate((tbodyXPath) => {
                    const tbody = document.evaluate(tbodyXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (!tbody) return { contests: [], rowCount: 0 };

                    const rows = tbody.querySelectorAll('tr');
                    const contestList = [];

                    for (let i = 0; i < rows.length; i++) {
                        const cells = rows[i].querySelectorAll('td');
                        if (cells.length < 3) continue;

                        const name = cells[1].textContent.replace(/\s+/g, ' ').trim(); // Col idx 1
                        const dateTime = cells[2].textContent.replace(/\s+/g, ' ').trim(); // Col idx 2

                        contestList.push({ name, dateTime });
                    }

                    return { contests: contestList, rowCount: rows.length };
                }, tbodyXPath);

                currentContests.contests.forEach(contest => contests.add(JSON.stringify(contest)));
                console.log(`Scraped Past CodeChef Contests (Scroll ${scrollAttempts + 1}): ${currentContests.contests.length} new rows`);

                if (currentContests.rowCount === previousRowCount) {
                    console.log('No new rows loaded, stopping lazy loading');
                    break;
                }

                previousRowCount = currentContests.rowCount;
                scrollAttempts++;

                await this.page.evaluate((tbodyXPath) => {
                    const tbody = document.evaluate(tbodyXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (tbody) tbody.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, tbodyXPath);

                await this.delay(2000); // Use fallback delay here too
            }

            const contestArray = Array.from(contests).map(item => JSON.parse(item));
            console.log('Scraped Past CodeChef Contests (Total):');
            contestArray.forEach(contest => {
                console.log(`Name: ${contest.name}, Date/Time: ${contest.dateTime}`);
            });

            return contestArray;
        } catch (error) {
            console.error('Error in scrapePastContestsWithLazyLoading:', error.message);
            return [];
        }
    }
}

module.exports = Codechef;

// Run the crawler
const codechef = new Codechef(5);