1. Overview

Grabber is a lightweight, single-purpose web tool that converts YouTube video URLs into downloadable MP3 audio files. It is built with plain HTML, CSS, and JavaScript — no frameworks, no build tools, no backend server required.


The tool is designed to feel as simple as possible: paste a link, press Convert, then press the round Download button. The MP3 downloads silently in the background — no new tabs, no redirects, nothing else happens on screen except the button turning green.


Key Features

• Paste any YouTube URL and convert to MP3 in seconds

• Displays the video thumbnail and title before downloading

• Round download button turns green and pulses while downloading

• Checkmark tick appears on the button when the download is complete

• Silent blob download — no new tabs or redirects opened

• Automatic fallback: tries 2 different APIs so one always works

• Fully mobile-responsive — works on phones and tablets

• Red and blue theme with smooth animations


2. File Structure

The project consists of exactly three files. All three must be kept in the same folder.


index.html The main HTML structure and page layout

style.css All visual styling — colours, layout, animations

app.js All logic — URL parsing, API calls, download handling


To use Grabber, simply open index.html in any modern web browser. No installation or server setup is needed.


3. How It Works

Step-by-Step Flow

1. User pastes a YouTube URL into the input bar and presses Convert

2. The app extracts the video ID from the URL

3. It fetches the video title and thumbnail from YouTube's oEmbed API (no CORS issues)

4. It calls the first RapidAPI (youtube-mp36) to get a direct MP3 download link

5. If the first API is still processing, it polls every 2.5 seconds up to 8 times

6. If the first API fails, it automatically falls back to the second API (youtube-to-mp315)

7. Once a link is obtained, the result screen shows the thumbnail, title, and the red download button

8. User presses the red round button — it instantly turns green and pulses

9. The MP3 is fetched as a binary blob in the background

10. A silent file save is triggered — the browser downloads the file with no new tabs opened

11. The button shows a checkmark tick for 5 seconds, then resets to red


URL Support

• Standard: https://www.youtube.com/watch?v=VIDEO_ID

• Short URL: https://youtu.be/VIDEO_ID

• Shorts: https://www.youtube.com/shorts/VIDEO_ID


4. API Setup

Grabber uses two free RapidAPI services. Both require a free subscription on RapidAPI before they will respond to requests. The API key is already embedded in app.js.


APIs Used

API Name youtube-mp36 (primary)

Provider ytjar

RapidAPI URL rapidapi.com/ytjar/api/youtube-mp36

Method GET /dl?id={videoId}

Response JSON with status, link, title, duration


API Name youtube-to-mp315 (fallback)

Provider marcocollatina

RapidAPI URL rapidapi.com/marcocollatina/api/youtube-to-mp315

Method GET /dl?id={videoId}

Response JSON with link, title


Subscribing to the APIs (one-time, free)

12. Go to rapidapi.com and create a free account or log in

13. Search for "youtube-mp36" — open it and click Subscribe on the Basic (Free) plan

14. Search for "youtube-to-mp315" — open it and click Subscribe on the Basic (Free) plan

15. Your RapidAPI key is universal — the same key works for both APIs once subscribed


Note: The API key is stored in app.js on the line that reads:

const RKEY = 'YOUR_KEY_HERE';


5. Customisation

Changing the Colour Theme

All colours are defined as CSS variables at the top of style.css inside the :root block. To change the theme, edit these values:

--red: #e8192c; /* button colour, logo accent, error states */

--blue: #1557ff; /* Convert button, input focus ring, links */

--green: #16a34a; /* download button active/done state */

--bg: #f0f4ff; /* page background */


Changing the Site Name

The logo text "GRABBER" is in index.html inside the .logo div. The red letter G is wrapped in a <span> tag. Edit both to rename the site.


Replacing the API Key

Open app.js and replace the key value on the first line of the script:

const RKEY = 'paste-your-new-key-here';


6. Hosting Online

Grabber works perfectly when opened as a local file on desktop. On mobile, hosting it online gives the most reliable experience. The easiest free options are:


Netlify Drop Drag the folder to netlify.com/drop — live in 10 seconds

GitHub Pages Push the 3 files to a GitHub repo and enable Pages in settings

Vercel Connect a GitHub repo or drag-drop at vercel.com

Tiiny Host Upload a ZIP of the 3 files at tiiny.host — no account needed


No server-side configuration is needed. All three files are static and can be served from any web host.


7. Troubleshooting

"No download link returned" Subscribe to both APIs on RapidAPI (see Section 4)

"Conversion failed" Check internet connection; video may be private or region-locked

File downloads but won't play The MP3 link may have expired — hit Convert another and retry

Button stays red after click The blob fetch failed; check browser console for details

Works on desktop, not mobile Host the files online (see Section 6) instead of opening locally

Thumbnail not showing YouTube's oEmbed may be slow — thumbnail will load shortly


8. Tech Stack

HTML5 Semantic structure, no frameworks

CSS3 Custom properties, flexbox, keyframe animations

Vanilla JS ES2020+, async/await, Fetch API, Blob URLs

Google Fonts Bebas Neue (logo), Nunito (body text)

RapidAPI youtube-mp36 and youtube-to-mp315 endpoints

YouTube oEmbed For fetching video title and thumbnail (no API key needed)
