// src/handler.js
export const handler = async (event) => {
    console.log("Event: ", event);
    
    // Get the path from the event
    const path = event.requestContext?.http?.path || event.path;
    
    // Handle specific routes
    if (path === "/test" && event.requestContext?.http?.method === "GET") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "This is the test endpoint!",
          timestamp: new Date().toISOString(),
        }),
      };
    }
    
    // Default route handler
    if (event.requestContext?.http?.method === "GET") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello from Lambda, This is the default route!",
          timestamp: new Date().toISOString(),
        }),
      };
    }
    
    // Return 405 Method Not Allowed for non-GET requests
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Method not allowed",
      }),
    };
  };