import axios, { AxiosInstance } from 'axios';

class SecurityApiService {

    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: 'https://whtwo8alk3.execute-api.eu-west-3.amazonaws.com/prod'
        });
    }

    public async getToken(username: string): Promise<any> {
        try {
            const response = await this.client.get('/cognito', { params: { username } });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Failed to fetch token');
            }
        } catch (error) {
            console.error('Error fetching token:', error);
            throw error;
        }
    }

}

export default new SecurityApiService();
