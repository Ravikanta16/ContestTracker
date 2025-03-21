Video Link - https://drive.google.com/file/d/1mEJAPO6K7Wvpf4aMpTsXdlqz8q8-Jm1b/view?usp=sharing


IN ORDER VIEW THE FRONT END CODE BASE KINDLY VISIT THIS REPO : https://github.com/Ravikanta16/Contest-Tracker-FE
(The React init app created a repo that started acting as a submodule and mess got created , thats why I have simply seperated the repo)

Overview

The Contest Tracker is a web application built using the MERN stack that helps competitive programmers keep track of past and upcoming coding contests from platforms like LeetCode and Codeforces. Users can bookmark contests, unbookmark them, and access solutions uploaded by the admin for past contests.

Features
- Fetch Contest Data: Automatically retrieves past and upcoming contests from LeetCode and Codeforces.
- Bookmark/Unbookmark Contests: Users can save important contests for future reference.
- Admin Panel:
  Admin can manage contests.
  Admin can upload solutions for past contests.
- User-Friendly UI: Simple and interactive interface for easy contest tracking.

Web Crawlers
- To ensure up-to-date contest data, web crawlers are implemented to fetch contest details from LeetCode and Codeforces. These crawlers parse relevant data and store it in the database for efficient access.
- The crawlers periodically fetch data from contest pages.
- Extracted data is cleaned and formatted before being stored.
- Processed contest details are saved in MongoDB.
- The system ensures existing contests are updated while preventing duplicate entries.

Technologies Used for Crawlers
- Puppeteer for automated browser interactions

User Endpoints
- POST /api/auth/register - For register.
- POST /api/auth/login - For login.
- POST /api/contests/all - Fetches all past and upcoming contests.
- POST /api/contests/getByPlatform - Fetches all past and upcoming contests.
- POST /api/contests/getPast - Fetches all past contests.
- POST /api/contests/getUpcoming - Fetches all upcoming contests.
- POST /api/bookmark/bookmark - Bookmark the important contests for future reference.

Admin Endpoints
- POST /api/auth/register - For register.
- POST /api/auth/login - For login.
- POST /api/contests/all - Fetches all past and upcoming contests.
- POST /api/contests/getByPlatform - Fetches all past and upcoming contests.
- POST /api/contests/getPast - Fetches all past contests.
- POST /api/contests/getUpcoming - Fetches all upcoming contests.
- POST /api/solution/addSolution - Add solution to past contests

Usage
- View upcoming and past contests from LeetCode and Codeforces.
- Bookmark important contests for quick access.
- Access contest solutions uploaded by the admin.
- Admins can upload solutions to past contests for user reference.
