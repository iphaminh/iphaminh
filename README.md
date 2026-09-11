# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Verifying tracking

The site loads GA4 (measurement ID `G-0CG3527HBH`) and the Meta Pixel (`1394177252086245`) once per page from `public/index.html`. The contact form in `src/components/ContactForm/ContactForm.js` fires `gtag('event', 'generate_lead', { form_id, interested_in })` and `fbq('track', 'Lead')` only after Formspree returns a 2xx response. The same form is embedded on each city page under `/wedding-videographer/:slug`, where `form_id` is `location-<slug>` (for example `location-napa-valley`); on `/contact` it is `contact`.

### GA4 DebugView

1. Enable debug mode in one of two ways: install the Google Analytics Debugger browser extension and turn it on, or open a page with `?debug_mode=1` appended to the URL (for example `https://www.phaminh.com/contact?debug_mode=1`).
2. In GA4, open Admin, then DebugView. Your browser should appear as a debug device within a few seconds.
3. Submit the contact form with a test message.
4. Watch the DebugView event stream for `generate_lead`. Click the event and confirm the `form_id` parameter matches the page you submitted from (`contact` or `location-<slug>`).
5. If `generate_lead` is missing, check the browser console for `gtag` errors and confirm Formspree returned a success response; the event only fires on success.

### Meta Events Manager Test Events

1. In Meta Events Manager, select the Phaminh pixel and open the Test Events tab.
2. Enter the site URL and click "Open website", or browse the site in the same browser where the Meta Pixel Helper extension is installed.
3. Submit the contact form with a test message.
4. Confirm a `Lead` event appears in the Test Events feed alongside the `PageView` events. The Pixel Helper extension also lists `Lead` on the page after a successful submit.

For both tools, use a test message that is clearly labelled so it can be ignored when it arrives by email.
