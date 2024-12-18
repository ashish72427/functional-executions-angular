const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const qs = require('qs');
const path = require('path');
const fs = require('fs');
const https = require('https');
const app = express();

app.use(bodyParser.json());
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
};

app.use(cors(corsOptions));
const clientId = '6e0418cf1aa34b91b4c219c3b68d1e6f';
const clientSecret = '6773b68BCFa241ED9c548D245d23A2B4';

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// app.post('/api/get-token', async (req, res) => {
//     try {
//         const response = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
//             grant_type: 'client_credentials',
//             client_id: clientId,
//             client_secret: clientSecret
//         }), {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             }
//         });
//         res.json(response.data);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// Route to get yearly basic test suites records 
//get-yearly-basic-test-suites-records
app.get('/api/get-yearly-basic-test-suites-records', async (req, res) => {
    try {
        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Function to fetch data for a specific month
        const fetchDataForMonth = async (year, month) => {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`;
            const endDate = new Date(year, month, 0).toISOString().replace(/T.*$/, 'T23:59:59Z'); // Last day of the month
            // console.log(`Fetching data for ${startDate} to ${endDate}`);
            const response = await axios.get(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuitesBasic?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        };

        // Fetch data for each month and combine
        const year = new Date().getFullYear();
        let combinedData = [];
        for (let month = 1; month <= 12; month++) {
            const monthlyData = await fetchDataForMonth(year, month);
            combinedData = combinedData.concat(monthlyData);
        }

        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching test suites records:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        res.status(500).json({ error: error.message });
    }
});

// Route to get yearly test suites records 
app.get('/api/get-yearly-test-suites-records', async (req, res) => {
    try {
        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Function to fetch data for a specific month
        const fetchDataForMonth = async (year, month) => {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`;
            const endDate = new Date(year, month, 0).toISOString().replace(/T.*$/, 'T23:59:59Z'); // Last day of the month
            // console.log(`Fetching data for ${startDate} to ${endDate}`);
            const response = await axios.get(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        };

        // Fetch data for each month and combine
        const year = new Date().getFullYear();
        let combinedData = [];
        for (let month = 1; month <= 12; month++) {
            const monthlyData = await fetchDataForMonth(year, month);
            combinedData = combinedData.concat(monthlyData);
        }

        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching test suites records:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        res.status(500).json({ error: error.message });
    }
});

// Route to get only last 7 days of data
app.get('/api/get-test-suites-records', async (req, res) => {
    try {
        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Calculate the date range for the last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const formattedStartDate = startDate.toISOString().replace(/T.*$/, 'T00:00:00Z');
        const formattedEndDate = endDate.toISOString().replace(/T.*$/, 'T23:59:59Z');

        // Fetch data for the last 7 days
        // const response = await axios.get(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
        const response = await axios.get(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuitesBasic?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching test suites records:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        res.status(500).json({ error: error.message });
    }
});

// Route to get filtered test suites records based on the provided startDate, endDate, and projectName
app.post('/api/get-filter-test-suites-records', async (req, res) => {
    try {
        const { projectName, startDate, endDate } = req.body;

        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Construct the API URL
        // let apiUrl = `https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites?`;
        let apiUrl = `https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuitesBasic?`;

        if (projectName && projectName !== 'ALL') {
            apiUrl += `project=${encodeURIComponent(projectName)}`;
        }

        // Calculate default start and end dates (last 7 days) if not provided
        const currentDate = new Date();
        const defaultEndDate = currentDate.toISOString().replace(/T.*$/, 'T23:59:59Z');
        const defaultStartDate = new Date(currentDate.setDate(currentDate.getDate() - 7)).toISOString().replace(/T.*$/, 'T00:00:00Z');

        const finalStartDate = startDate ? new Date(startDate).toISOString().replace(/T.*$/, 'T00:00:00Z') : defaultStartDate;
        const finalEndDate = endDate ? new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)).toISOString().replace(/T.*$/, 'T23:59:59Z') : defaultEndDate;

        apiUrl += `&startDate=${finalStartDate}&endDate=${finalEndDate}`;

        // Fetch data based on the provided filters
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let filteredData = response.data;

        res.json(filteredData);
    } catch (error) {
        console.error('Error fetching filtered test suites records:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        res.status(500).json({ error: error.message });
    }
});

// Route to get filtered test suites records based on the provided startDate, endDate, and projectName from whole year
app.post('/api/get-filter-test-suites-records-year', async (req, res) => {
    try {
        const { projectName, startDate, endDate } = req.body;

        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const token = tokenResponse.data.access_token;

        // Construct the API URL
        let apiUrl = `https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuitesBasic?`;
        if (projectName && projectName !== 'ALL') {
            apiUrl += `project=${encodeURIComponent(projectName)}`;
        }

        // Fetch data for each month of the current year
        const currentYear = new Date().getFullYear();
        let allData = [];
        for (let month = 0; month < 12; month++) {
            const monthStartDate = new Date(Date.UTC(currentYear, month, 1)).toISOString().replace(/T.*$/, 'T00:00:00Z');
            const monthEndDate = new Date(Date.UTC(currentYear, month + 1, 0, 23, 59, 59)).toISOString().replace(/T.*$/, 'T23:59:59Z');
            const monthlyApiUrl = `${apiUrl}&startDate=${monthStartDate}&endDate=${monthEndDate}`;
            const response = await axios.get(monthlyApiUrl, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            allData = allData.concat(response.data);
        }

        // Validate and parse the provided date range
        const parseDate = (dateStr) => {
            const date = new Date(dateStr);
            if (isNaN(date)) {
                throw new Error(`Invalid date: ${dateStr}`);
            }
            return date.toISOString().replace(/T.*$/, 'T00:00:00Z');
        };

        const finalStartDate = startDate ? parseDate(startDate) : null;
        const finalEndDate = endDate ? parseDate(new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1))) : null;

        // Filter data based on the provided date range
        const filteredData = allData.filter(record => {
            const recordDate = new Date(record.startTime);
            if (isNaN(recordDate)) {
                return false;
            }
            const recordDateString = recordDate.toISOString();
            return (!finalStartDate || recordDateString >= finalStartDate) && (!finalEndDate || recordDateString <= finalEndDate);
        });

        res.json(filteredData);
    } catch (error) {
        console.error('Error fetching filtered test suites records:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        res.status(500).json({ error: error.message });
    }
});

// Route to get test steps records
app.get('/api/get-test-steps-records/:testSuiteId/:testCaseId', async (req, res) => {
    try {
        const { testSuiteId, testCaseId } = req.params;

        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Use the token to access the test steps records API
        const testStepsResponse = await axios.get(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites/${testSuiteId}/testCases/${testCaseId}/testSteps`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        res.json(testStepsResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Route to get test cases records
app.get('/api/get-test-cases-records/:testSuiteId', async (req, res) => {
    try {
        const { testSuiteId, testCaseId } = req.params;

        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Use the token to access the test cases records API
        const testStepsResponse = await axios.get(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites/${testSuiteId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        res.json(testStepsResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to update test suites records
app.patch('/api/update-test-suites-records/:testSuiteId', async (req, res) => {
    try {
        const { testSuiteId } = req.params;
        const updateData = req.body;

        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        const updateResponse = await axios.patch(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites/${testSuiteId}`, updateData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(updateResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete test suites records
app.delete('/api/delete-test-suites-records/:testSuiteId', async (req, res) => {
    try {
        const { testSuiteId } = req.params;

        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Use the token to delete the test suite record
        const deleteResponse = await axios.delete(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites/${testSuiteId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        res.json({ message: `Record with ID ${testSuiteId} deleted successfully.` });
    } catch (error) {
        console.error('Error deleting record:', error.response ? error.response.data : error.message); // Log detailed error
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

// Route to update test cases records
app.patch('/api/update-test-cases/:testSuiteId/testCases/:testCaseId', async (req, res) => {
    try {
        const { testSuiteId, testCaseId } = req.params;
        const updateData = req.body;

        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Use the token to update the test case record
        const updateResponse = await axios.patch(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites/${testSuiteId}/testCases/${testCaseId}`, updateData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(updateResponse.data);
    } catch (error) {
        console.error('Error updating record:', error.response ? error.response.data : error.message); // Log detailed error
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

// Route to delete test cases records
app.delete('/api/delete-test-cases/:testSuiteId/testCases/:testCaseId', async (req, res) => {
    try {
        const { testSuiteId, testCaseId } = req.params;

        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Use the token to delete the test case record
        const deleteResponse = await axios.delete(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites/${testSuiteId}/testCases/${testCaseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        res.json({ message: `Record with ID ${testCaseId} deleted successfully.` });
    } catch (error) {
        console.error('Error deleting record:', error.response ? error.response.data : error.message); // Log detailed error
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

app.patch('/api/update-failed-counts/:testSuiteId', async (req, res) => {
    try {
        const { testSuiteId } = req.params;
        const { scriptFailures, applicationFailures } = req.body;

        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Create the payload with updated fields
        const payload = {
            scriptFailures,
            applicationFailures
        };

        // Use the token to update the test suite record
        const updateResponse = await axios.patch(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites/${testSuiteId}`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(updateResponse.data);
    } catch (error) {
        console.error('Error updating record:', error.response ? error.response.data : error.message); // Log detailed error
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

app.patch('/api/add-defects/:testSuiteId', async (req, res) => {
    try {
        const { testSuiteId } = req.params;
        const { defectsCount, defectsDescription } = req.body;

        // First, get the OAuth token
        const tokenResponse = await axios.post('https://authentication.api.fastenal.com/oauth/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = tokenResponse.data.access_token;

        // Create the payload with updated fields
        const payload = {
            defectsCount,
            defectsDescription
        };

        // Use the token to update the test suite record
        const updateResponse = await axios.patch(`https://functional-reporting-tracker-sys.api.fastenal.com/functional-report/api/v1/testSuites/${testSuiteId}`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(updateResponse.data);
    } catch (error) {
        console.error('Error updating record:', error.response ? error.response.data : error.message); // Log detailed error
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

// Fallback to index.html for Angular routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
    if (err instanceof URIError) {
        res.status(400).send('Bad Request: Invalid URL');
    } else {
        next(err);
    }
});

// Load SSL certificates
const privateKey = fs.readFileSync(path.join(__dirname, 'cert', 'certkey.key'));
const certificate = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'));

const credentials = {
    key: privateKey,
    cert: certificate,
};

const PORT = process.env.PORT || 3500; // Ensure this matches the port you're using

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});






// const PORT = process.env.PORT || 3500; // Ensure this matches the port you're using
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });