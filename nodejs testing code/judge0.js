const axios = require('axios');

// C source code for Hello World with name input
const code_script = `
#include <stdio.h>

int main(void) {
    char name[100];  // Increased array size to handle longer names
    if (scanf("%99s", name) != 1) {  // Prevents overflow, ensures input is valid
        printf("Error reading input\\n");
        return 1;
    }
    printf("hello, %s\\n", name);
    return 0;
}
`;

// Options for the POST request to submit code
const options = {
  method: 'POST',
  url: 'http://192.168.16.124/submissions',
  headers: {
    'content-type': 'application/json',
  },
  data: {
    source_code: code_script,
    language_id: 50, // C language ID
    stdin: 'Judge0', // Input provided for the program
    expected_output: 'hello, Judge0\n', // Expected output
    cpu_time_limit: 2, // CPU time limit in seconds
    cpu_extra_time: 0.5, // Extra CPU time in seconds
    wall_time_limit: 5, // Wall time limit in seconds
    memory_limit: 128000, // Memory limit in KB (128MB)
    stack_limit: 64000, // Stack limit in KB
    max_processes_and_or_threads: 60, // Max number of processes/threads
    enable_per_process_and_thread_time_limit: true, // Enable time limit
    enable_per_process_and_thread_memory_limit: true, // Enable memory limit
    max_file_size: 1024, // Max file size for the code submission in KB
  },
};

const run = async () => {
  try {
    // Submit the code to Judge0
    const response = await axios.request(options);

    // Check if the response contains a token
    if (!response.data.token) {
      throw new Error('No submission token returned by Judge0 API.');
    }

    const token = response.data.token;
    console.log('Submission Token:', token);

    // Prepare options to fetch the submission result
    const getResultOptions = {
      method: 'GET',
      url: `http://192.168.16.124/submissions/${token}`,
      params: { base64_encoded: 'false', fields: '*' },
      headers: {
        'content-type': 'application/json',
      },
    };

    // Wait for processing and fetch the result
    setTimeout(async () => {
      try {
        const resultResponse = await axios.request(getResultOptions);
        console.log('Execution Result:', resultResponse.data);

        // Check the result for errors
        if (resultResponse.data.status && resultResponse.data.status.description !== 'Accepted') {
          console.error('Error in code execution:', resultResponse.data.status.description);
          if (resultResponse.data.message) {
            console.error('Error Message:', resultResponse.data.message);
          }
        } else {
          console.log('Execution Output:', resultResponse.data.stdout);
        }
      } catch (fetchError) {
        console.error('Error fetching submission result:', fetchError.message);
      }
    }, 3000); // Wait 3 seconds for processing
  } catch (error) {
    console.error('Error submitting code:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data); // Log the response body for more info
    }
  }
};

run();
