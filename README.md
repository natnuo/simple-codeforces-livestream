<div align="center">
<h1>Easy Codeforces Livestream</h1>

A simple-to-install, live-updating "submissions" and "standings" display for your Codeforces contest live streams. Gyms, mashups, and team contests are supported.

<img width="25%" src="https://github.com/user-attachments/assets/c787488e-7990-4f33-ada2-3e02330c5b91" alt="submissions page"></img>
<img width="68%" src="https://github.com/user-attachments/assets/cc363763-e3d3-4fdb-b4b0-273536b137d1" alt="standings page"></img>

</div>

<h2>Installation & Setup</h2>

Time to complete: ~5 minutes

<h3>Obtaining a Codeforces API Key</h3>

Navigate to <a href="https://codeforces.com/settings/api">https://codeforces.com/settings/api</a> and add a new Codeforces API Key. Save the key and the secret.

<h3>Obtaining the software</h3>

Clone this repository:

<pre>git clone https://github.com/natnuo/easy-codeforces-livestream.git</pre>

<h3>Linking the Codeforces API Key (and Secret)</h3>

You need to add your Codeforces API Key and Secret as environment variables. In Windows, this can be done by searching in the taskbar for <i>"Edit the system environment variables"</i>, clicking <i>"Environment Variables..."</i>, then 
adding new user variables (there are ways described online to add environment variables on other operating systems as well). You need to add the following values:

1. <b>Name:</b> <code>CODEFORCES_API_KEY</code>, <b>Value:</b> <i>Your Codeforces API Key</i>
2. <b>Name:</b> <code>CODEFORCES_API_SECRET</code>, <b>Value:</b> <i>Your Codeforces API Secret</i>

After adding the variables, restart your terminal if it is currently open.

<h3>Editing Settings</h3>

Navigate within the respository and view the <code>src/settings.ts</code> file. The settings before the first blank line should by modified for each contest. The <code>CONTEST_ID</code> can be found in the URL of the contest page. For example, the contest: <a href="https://codeforces.com/contest/2013">https://codeforces.com/contest/2013</a> has a <code>CONTEST_ID</code> of <code>2013</code>, and the gym <a href="https://codeforces.com/gym/105404">https://codeforces.com/gym/105404</a> has a <code>CONTEST_ID</code> of <code>105404</code>. Mashup <code>CONTEST_ID</code> values can be found similarly to that of gyms.

For the <code>PROBLEM_COLORS</code> setting, list each problem's code (e.g. <code>"A"</code>, <code>"C"</code>, <code>"F2"</code>), along with the HEX color code you want to associate with that problem. The keys in `PROBLEM_COLORS` must exactly match the problems in the chosen contest or the livestream will not display correctly, and the provided HEX codes <b>must be six characters</b> (three character or eight character HEX codes are invalid). This six-character policy applies for all HEX colors in `settings.ts`.

If you are using <code>localhost:3000</code> for another program, you may change the port our software uses by editing the <code>PORT</code> value in <code>settings.ts</code>.

<h3>Building and Starting the Server</h3>

At the root of the repository, run <code>npm build</code>, then <code>npm start</code>. You must run both of these commands each time you edit <code>settings.ts</code>. (If you did not edit <code>settings.ts</code>, you may run only <code>npm start</code>.)

<h3>Connecting to your Livestream</h3>

For the purposes of this tutorial, I will use OBS Studio for live streaming.

Within OBS, create a new <i>"Browser"</i> source.

If you want to add the live-updating submissions queue (list of recent submissions) to your live stream, then set your URL as <code>http://localhost:3000/status</code> (change the port if applicable). For the status page (the page with the submissions queue), a general resolution of 380x800 is recommended, though other values may work better for your specific purposes and depending on the number of submission you choose to display.

If you want to add the live-updating standings page to your live stream, then set your URL as <code>http://localhost:3000/standings</code> (once again, change the port if applicable). For the standings page, a general resolution of 1000x700 is recommended, though other values may work better for your specific purposes and depending on the number of standings you choose to display.

That's it! Now you have live-updating information from Codeforces, in your live stream! Nice.

Each time you want to display a different contest, you can edit the associated information in <code>settings.ts</code>, execute <code>npm run build</code> and <code>npm start</code>, then refresh your OBS <i>"Browser"</i> source. Simple as that.
