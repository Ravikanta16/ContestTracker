const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class Codeforces {
    constructor(pageCount = 5) {
        this.baseURL = "https://codeforces.com/contests";
        this.pageCount = pageCount; // Included for consistency, optional for Codeforces
        this.browser = null;
        this.page = null;
        this.contests = [];
    }
    convertToISOString(dateStr) {
        const [_, month, day, year, time, offset] = dateStr.match(/(\w+)\/(\d{2})\/(\d{4}) (\d{2}:\d{2})UTC([+-]\d+\.?\d*)/);
        const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        const date = new Date(`${year}-${String(months[month] + 1).padStart(2, '0')}-${day}T${time}:00.000Z`);
        date.setMinutes(date.getMinutes() - parseFloat(offset) * 60);
        return date.toISOString();
    }


    async waitForXPath(page, xpath, timeout = 10000) {
        await page.waitForFunction(
            (xpath) => !!document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,
            { timeout },
            xpath
        );
    }

    async init() {
        const contests = await this.fetchContestPages();
        this.contests = contests;
        // console.log('Final Contest List:', contests);
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
            const upcomingXPath = '//*[@id="pageContent"]/div[1]/div[1]/div[6]/table/tbody';
            const pastXPath = '//*[@id="pageContent"]/div[1]/div[2]/div[1]/div[6]/table/tbody';
            const navXPath = '//*[@id="pageContent"]/div[1]/div[2]/div[2]'; 

            // this.page.on('console', msg => console.log('Browser Console:', msg.text()));

            console.log('Initial URL:', await this.page.url());

            // Scrape upcoming contests (no pagination assumed for now)
            await this.waitForXPath(this.page, upcomingXPath);
            const upcomingContests = await this.scrapeContestList(upcomingXPath, 'Upcoming');
            allContests.push(...upcomingContests);

            // Scrape past contests with pagination if applicable
            await this.waitForXPath(this.page, pastXPath);
            for (let i = 0; i < this.pageCount; i++) {
                console.log(`Fetching past contests from page ${i + 1}`);
                const pastContests = await this.scrapeContestList(pastXPath, 'Past');
                allContests.push(...pastContests);

                // Check for pagination and click next if not the last iteration
                if (i < this.pageCount - 1) {
                    const navigated = await this.clickPageButton(navXPath, i);
                    if (navigated) {
                        console.log('Navigation detected, waiting for page load');
                        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(async () => {
                            console.log('Navigation timeout, assuming dynamic load');
                            await this.page.waitForTimeout(2000);
                        });
                        await this.waitForXPath(this.page, pastXPath);
                    } else {
                        console.log('No navigation, assuming all contests loaded or no pagination');
                        break; // Exit loop if no pagination detected
                    }
                }
            }

            return allContests;
        } catch (error) {
            console.error('Error in fetchContestPages:', error.message);
            return allContests;
        } finally {
            if (this.browser) await this.browser.close();
        }
    }

    
    async clickPageButton(navXPath, pageIndex) {
        const pageButtonXPath = `${navXPath}//a[text()="${pageIndex + 2}"]`; 
        try {
            await this.waitForXPath(this.page, pageButtonXPath, 5000); 
        } catch (e) {
            console.log('Pagination button not found, assuming single page');
            return false;
        }

        await this.page.evaluate((xpath) => {
            const button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (!button) throw new Error(`Button not found at ${xpath}`);
            console.log(`Clicking page with XPath: ${xpath}`);
            button.click();
        }, pageButtonXPath);

        return this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 500 }).then(() => true).catch(() => false);
    }

    async scrapeContestList(tbodyXPath, type) {
        try {
           
            const contests = await this.page.evaluate((tbodyXPath) => {
                const convertToISOString = (dateStr) =>   {
                    const [_, month, day, year, time, offset] = dateStr.match(/(\w+)\/(\d{2})\/(\d{4}) (\d{2}:\d{2})UTC([+-]\d+\.?\d*)/);
                    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
                    const date = new Date(`${year}-${String(months[month] + 1).padStart(2, '0')}-${day}T${time}:00.000Z`);
                    date.setMinutes(date.getMinutes() - parseFloat(offset) * 60);
                    return date.toISOString();
                }
                const tbody = document.evaluate(tbodyXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (!tbody) return [];

                const rows = tbody.querySelectorAll('tr');
                const contestList = [];

                for (let i = 1; i < rows.length; i++) { // Skip header row
                    const cells = rows[i].querySelectorAll('td');
                    if (cells.length < 2) continue;

                    // const name = cells[0].textContent.replace(/\s+/g, ' ').trim()
                    // const dateTime = cells[2].textContent.replace(/\s+/g, ' ').trim()
                    const nameNode = Array.from(cells[0].childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                const name = nameNode ? nameNode.textContent.replace(/\s+/g, ' ').trim() : 'Unknown Contest';
                const dateTime = cells[2].textContent.replace(/\s+/g, ' ').trim();

                // contestList.push({ name, dateTime });

                    contestList.push({ name, date: convertToISOString(dateTime), platform: 'codeforces' });
                }

                return contestList;
            }, tbodyXPath);

            console.log(`Scraped ${type} Codeforces Contests:`);
            contests.forEach(contest => {
                console.log(`Name: ${contest.name}, Date/Time: ${contest.dateTime}`);
            });

            return contests;
        } catch (error) {
            console.error(`Error in scrapeContestList (${type}):`, error.message);
            return [];
        }
    }
}

module.exports = Codeforces;

// const codeforces = new Codeforces(5);