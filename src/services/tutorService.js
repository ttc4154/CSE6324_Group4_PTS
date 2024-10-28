// src/services/tutorService.js
import axios from 'axios';

const API_URL = 'https://api.example.com/tutors';

export const fetchTutors = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
