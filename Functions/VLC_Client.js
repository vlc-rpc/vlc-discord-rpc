import { Buffer } from 'buffer'; 
import { URL } from 'url';

class Client {
  constructor(address, password, advanced = {}) {
    const server = new URL(address);

    this.server = server;
    this.password = password; 
    this.advanced = advanced; 
  }

  async getStatus() {
    const base = this.server.toString();
    console.log(`Connecting to VLC server at: ${base}`);  

    const target = "http://" + base + "/requests/status.json";
    
    try {
      const data = await this.request(target);
      console.log('Response from VLC:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch VLC status:', error);
    }
  }

  async request(target) {
    try {
      const basicAuth = Buffer.from(":" + this.password).toString('base64');
      console.log(target);
      const response = await fetch(target, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        },
        ...this.advanced 
      });

      if (!response.ok) {
        throw new Error(`Failed to reach VLC: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in request:', error.message);
      throw new Error('Failed to reach VLC. Is it open?');
    }
  }
}

export default Client;
