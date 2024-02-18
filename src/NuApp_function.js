function parseStreamedData(dataString) {
    try {
      // Initialize an accumulator for JSON data
      let jsonDataAccumulator = '';
      const lines = dataString.split('\n');
      const parsedData = [];

      lines.forEach(line => {
        // Remove 'data: ' prefix and trim
        line = line.replace(/^data: /, '').trim();

        if (line === '[DONE]') {
          // End of data stream
          return;
        }

        jsonDataAccumulator += line;

        try {
          const parsedJson = JSON.parse(jsonDataAccumulator);
          // If parse is successful, reset the accumulator and store the parsed data
          jsonDataAccumulator = '';
          parsedData.push(parsedJson);
        } catch {
          // If JSON is incomplete, wait for more data
        }
      });

      return parsedData;
    } catch (error) {
      console.error('Error parsing chunk:', error);
      return [];
    }
  }