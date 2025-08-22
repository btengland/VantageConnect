// Replace with your actual API Gateway endpoint
const API_BASE_URL = 'https://your-api-gateway-id.execute-api.your-region.amazonaws.com/prod';

export const hostGame = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/hostSessionHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty body for hostGame as per the lambda
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || 'Failed to host game');
    }

    return await response.json();
  } catch (error) {
    console.error('Error hosting game:', error);
    throw error;
  }
};

export const joinGame = async (sessionCode: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/joinSessionHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionCode: sessionCode }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || 'Failed to join game');
    }

    return await response.json();
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};
