const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class Leetcode {
    constructor(pageCount = 5) {
        this.baseURL = "https://leetcode.com/";
        this.pageCount = pageCount;
        this.browser = null;
        this.page = null;
        this.contests = [];
        
    }

    async waitForXPath(page, xpath, timeout = 10000) {
        await page.waitForFunction(
            (xpath) => !!document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,
            { timeout },
            xpath
        );
    }

     convertToISOStringV2(dateStr) {
        // Match format: "Sunday 8:00 AM GMT+5:30"
        const regex = /(\w+) (\d{1,2}:\d{2}) (\w{2}) GMT([+-])(\d{1,2}):(\d{2})/;
        const match = dateStr.match(regex);
    
        if (!match) {
            throw new Error("Invalid date string format");
        }
    
        const [_, weekday, time, meridian, offsetSign, offsetHours, offsetMinutes] = match;
    
        // Parse time
        let [hours, minutes] = time.split(":").map(Number);
        if (meridian === "PM" && hours !== 12) hours += 12;
        if (meridian === "AM" && hours === 12) hours = 0;
    
        // Use today as reference (March 19, 2025)
        const now = new Date();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const targetDayIndex = days.indexOf(weekday); // e.g., Sunday = 0
        const currentDayIndex = now.getUTCDay(); // e.g., Wednesday = 3
        let dayOffset = targetDayIndex - currentDayIndex;
        
        // If dayOffset is negative or zero, go to the previous Sunday
        if (dayOffset <= 0) dayOffset -= 7; // e.g., -3 becomes -10 to get last Sunday
    
        // Set date to the most recent Sunday
        const baseDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset));
        baseDate.setUTCHours(hours, minutes, 0, 0);
    
        // Apply GMT+5:30 offset (330 minutes ahead, subtract to get UTC)
        const offset = (parseInt(offsetHours) * 60 + parseInt(offsetMinutes)) * (offsetSign === "+" ? -1 : 1);
        baseDate.setUTCMinutes(baseDate.getUTCMinutes() + offset);
    
        return baseDate.toISOString();
    }
    async init() {
        const contests = await this.fetchContestPages();
        this.contests = contests;
        // console.log('Final Contest List:', contests);
        if (this.browser) await this.browser.close();
    }

    async fetchUpcomingContests() {
        const upcomingContestsXPathWeekly_name  = '//*[@id="__next"]/div[1]/div[4]/div/div/div[2]/div/div/div[1]/div/div/div[1]/div/a/div[2]/div/div[1]/div/span'
        const upcomingContestsXPathWeekly_date = '//*[@id="__next"]/div[1]/div[4]/div/div/div[2]/div/div/div[1]/div/div/div[1]/div/a/div[2]/div/div[2]'
        
        const upcomingContestsXPathBiweekly_name = '//*[@id="__next"]/div[1]/div[4]/div/div/div[2]/div/div/div[1]/div/div/div[2]/div/a/div[2]/div/div[1]/div/span'
        const upcomingContestsXPathBiweekly_date = '//*[@id="__next"]/div[1]/div[4]/div/div/div[2]/div/div/div[1]/div/div/div[2]/div/a/div[2]/div/div[2]'

        this.page.on('console', msg => console.log('Browser Console:', msg.text()));

        await this.waitForXPath(this.page, upcomingContestsXPathWeekly_name);
        await this.waitForXPath(this.page, upcomingContestsXPathWeekly_date);
        await this.waitForXPath(this.page, upcomingContestsXPathBiweekly_name);
        await this.waitForXPath(this.page, upcomingContestsXPathBiweekly_date);

        const weeklyContestName = await this.page.evaluate((xpath) => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            return element ? element.textContent.trim() : 'Unknown Contest';
        }, upcomingContestsXPathWeekly_name);

        const weeklyContestDate = await this.page.evaluate((xpath) => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            return element ? element.textContent.trim() : 'Unknown Contest';
        }, upcomingContestsXPathWeekly_date);
        
        const biweeklyContestName = await this.page.evaluate((xpath) => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            return element ? element.textContent.trim() : 'Unknown Contest';
        }, upcomingContestsXPathBiweekly_name);

        const biweeklyContestDate = await this.page.evaluate((xpath) => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            return element ? element.textContent.trim() : 'Unknown Contest';
        }, upcomingContestsXPathBiweekly_date);

        return [
            {
                name: weeklyContestName,
                date: this.convertToISOStringV2(weeklyContestDate),
                platform: 'leetcode'
            },
            {
                name: biweeklyContestName,
                date: this.convertToISOStringV2(biweeklyContestDate),
                platform: 'leetcode'
            }
        ]
        

        
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
            await this.page.goto(`${this.baseURL}/contest/`, { waitUntil: 'networkidle2', timeout: 30000 });
            const navXPath = '//*[@id="__next"]/div[1]/div[4]/div/div/div[4]/div[2]/div[1]/div/div/div[2]/div/div[2]/nav';
            const containerXPath = '//*[@id="__next"]/div[1]/div[4]/div/div/div[4]/div[2]/div[1]/div/div/div[2]/div/div[1]/div';
           const upcomingContests = await this.fetchUpcomingContests();
           allContests.push(...upcomingContests);
            this.page.on('console', msg => console.log('Browser Console:', msg.text()));

            await this.waitForXPath(this.page, navXPath);
            await this.waitForXPath(this.page, containerXPath);

            // console.log('Initial URL:', await this.page.url());

            for (let i = 0; i < this.pageCount; i++) {
                console.log(`Fetching contests from page ${i + 1}`);

                const pageContests = await this.scrapeContestList(containerXPath);
                allContests.push(...pageContests);

                if (i < this.pageCount - 1) {
                    const navigated = await this.clickPageButton(navXPath, i);
                    if (navigated) {
                        console.log('Navigation detected, waiting for page load');
                        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(async (err) => {
                            // console.log('Navigation timeout, assuming dynamic load. Current URL:', await this.page.url());
                            // await this.page.waitForTimeout(2000);
                        });
                        await this.waitForXPath(this.page, containerXPath);
                    } else {
                        // console.log('No navigation, assuming dynamic load');
                        // await this.page.waitForTimeout(2000);
                        await this.waitForXPath(this.page, containerXPath);
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
        const pageButtonXPath = `${navXPath}/button[${pageIndex + 1}]`; // e.g., .../nav/button[2] for page 2
        await this.waitForXPath(this.page, pageButtonXPath);

        await this.page.evaluate((xpath) => {
            const button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (!button) throw new Error(`Button not found at ${xpath}`,button.textContent);
            // console.log(`Clicking page with XPath: ${xpath}`);
            button.click();
        }, pageButtonXPath);

        return this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 500 }).then(() => true).catch(() => false);
    }

  
    
    async scrapeContestList(containerXPath) {

        try {
            const contests = await this.page.evaluate((containerXPath) => {
                const convertToISOStringV2 = (dateStr) => {
                   // Match format: "Sunday 8:00 AM GMT+5:30"
                        const regex = /(\w+) (\d{1,2}:\d{2}) (\w{2}) GMT([+-])(\d{1,2}):(\d{2})/;
                        const match = dateStr.match(regex);
                    
                        if (!match) {
                            throw new Error("Invalid date string format");
                        }
                    
                        const [_, weekday, time, meridian, offsetSign, offsetHours, offsetMinutes] = match;
                    
                        // Parse time
                        let [hours, minutes] = time.split(":").map(Number);
                        if (meridian === "PM" && hours !== 12) hours += 12;
                        if (meridian === "AM" && hours === 12) hours = 0;
                    
                        // Use today as reference (March 19, 2025)
                        const now = new Date();
                        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        const targetDayIndex = days.indexOf(weekday); // e.g., Sunday = 0
                        const currentDayIndex = now.getUTCDay(); // e.g., Wednesday = 3
                        let dayOffset = targetDayIndex - currentDayIndex;
                        
                        // If dayOffset is negative or zero, go to the previous Sunday
                        if (dayOffset <= 0) dayOffset -= 7; // e.g., -3 becomes -10 to get last Sunday
                    
                        // Set date to the most recent Sunday
                        const baseDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset));
                        baseDate.setUTCHours(hours, minutes, 0, 0);
                    
                        // Apply GMT+5:30 offset (330 minutes ahead, subtract to get UTC)
                        const offset = (parseInt(offsetHours) * 60 + parseInt(offsetMinutes)) * (offsetSign === "+" ? -1 : 1);
                        baseDate.setUTCMinutes(baseDate.getUTCMinutes() + offset);
                    
                        return baseDate.toISOString();
                }
                const container = document.evaluate(containerXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (!container) return [];

                const contestElements = container.children;
                const contestList = [];

                for (let i = 0; i < contestElements.length; i++) {
                    const contestDiv = contestElements[i];

                    const linkXPath = './/a[starts-with(@href, "/contest/") and @data-contest-title-slug]';
                    const linkNode = document.evaluate(linkXPath, contestDiv, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (!linkNode) continue;

                    const titleXPath = './/span[@title]';
                    const titleNode = document.evaluate(titleXPath, linkNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    const name = titleNode ? titleNode.textContent.trim() : 'Unknown Contest';

                    const dateXPath = './/div[contains(@class, "text-[11px]")]';
                    const dateNode = document.evaluate(dateXPath, linkNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    const dateTime = dateNode ? dateNode.textContent.trim() : 'Date not found';

                    contestList.push({ name, date: convertToISOStringV2(dateTime), platform: 'leetcode' });
                }

                return contestList;
            }, containerXPath,this.convertToISOStringV2.toString());

            // console.log(`Scraped Contests from Page:`);
            // contests.forEach(contest => {
            //     console.log(`Name: ${contest.name}, Date/Time: ${contest.dateTime}`);
            // });

            return contests;
        } catch (error) {
            console.error('Error in scrapeContestList:', error.message);
            return [];
        }
    }
}

module.exports = Leetcode;

// Run the crawler
// const leetcode = new Leetcode(5);