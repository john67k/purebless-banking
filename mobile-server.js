const express = require('express');
const path = require('path');

const app = express();
const port = 4000;

// Serve static files from the current directory
app.use(express.static('.'));

// For any request that doesn't match a static file, return the main HTML file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at:`);
    console.log(`  Local:   http://localhost:${port}/`);
    console.log(`  Network: http://192.168.0.198:${port}/`);
    console.log(`  Network: http://10.5.0.2:${port}/`);
});