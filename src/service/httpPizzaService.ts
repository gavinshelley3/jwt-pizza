import { PizzaService, Franchise, FranchiseList, Store, OrderHistory, User, UserList, Menu, Order, Endpoints, OrderResponse, JWTPayload } from './pizzaService';
import { clearAuthToken, getAuthToken, persistAuthToken, withAuthHeaders } from './authenticatedRequest';

const pizzaServiceUrl = import.meta.env.VITE_PIZZA_SERVICE_URL;
const pizzaFactoryUrl = import.meta.env.VITE_PIZZA_FACTORY_URL;

class HttpPizzaService implements PizzaService {
  async callEndpoint(path: string, method: string = 'GET', body?: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const options: RequestInit = {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        if (!path.startsWith('http')) {
          path = pizzaServiceUrl + path;
        }

        // Attach Authorization: Bearer <token> once the user logs in.
        const requestOptions = withAuthHeaders(options);

        const r = await fetch(path, requestOptions);
        const j = await r.json();
        if (r.ok) {
          resolve(j);
        } else {
          reject({ code: r.status, message: j.message });
        }
      } catch (e: any) {
        reject({ code: 500, message: e.message });
      }
    });
  }

  async login(email: string, password: string): Promise<User> {
    const { user, token } = await this.callEndpoint('/api/auth', 'PUT', { email, password });
    persistAuthToken(token);
    return Promise.resolve(user);
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const { user, token } = await this.callEndpoint('/api/auth', 'POST', { name, email, password });
    persistAuthToken(token);
    return Promise.resolve(user);
  }

  logout(): void {
    this.callEndpoint('/api/auth', 'DELETE');
    clearAuthToken();
  }

  async getUser(): Promise<User | null> {
    let result: User | null = null;
    if (getAuthToken()) {
      try {
        result = await this.callEndpoint('/api/user/me');
      } catch (e) {
        clearAuthToken();
      }
    }
    return Promise.resolve(result);
  }

  async getMenu(): Promise<Menu> {
    return this.callEndpoint('/api/order/menu');
  }

  async getOrders(user: User): Promise<OrderHistory> {
    return this.callEndpoint('/api/order');
  }

  async order(order: Order): Promise<OrderResponse> {
    return this.callEndpoint('/api/order', 'POST', order);
  }

  async verifyOrder(jwt: string): Promise<JWTPayload> {
    return this.callEndpoint(pizzaFactoryUrl + '/api/order/verify', 'POST', { jwt });
  }

  async updateUser(updatedUser: User): Promise<User> {
    const response = await this.callEndpoint(`/api/user/${updatedUser.id}`, 'PUT', updatedUser);
    if (response?.token) {
      persistAuthToken(response.token);
    }
    return Promise.resolve(response?.user ?? response);
  }

  async getUsers(page: number = 1, limit: number = 10, nameFilter: string = '*'): Promise<UserList> {
    return this.callEndpoint(`/api/user?page=${page}&limit=${limit}&name=${nameFilter}`);
  }

  async deleteUser(user: User): Promise<void> {
    return this.callEndpoint(`/api/user/${user.id}`, 'DELETE');
  }

  async getFranchise(user: User): Promise<Franchise[]> {
    return this.callEndpoint(`/api/franchise/${user.id}`);
  }

  async createFranchise(franchise: Franchise): Promise<Franchise> {
    return this.callEndpoint('/api/franchise', 'POST', franchise);
  }

  async getFranchises(page: number = 0, limit: number = 10, nameFilter: string = '*'): Promise<FranchiseList> {
    return this.callEndpoint(`/api/franchise?page=${page}&limit=${limit}&name=${nameFilter}`);
  }

  async closeFranchise(franchise: Franchise): Promise<void> {
    return this.callEndpoint(`/api/franchise/${franchise.id}`, 'DELETE');
  }

  async createStore(franchise: Franchise, store: Store): Promise<Store> {
    return this.callEndpoint(`/api/franchise/${franchise.id}/store`, 'POST', store);
  }

  async closeStore(franchise: Franchise, store: Store): Promise<null> {
    return this.callEndpoint(`/api/franchise/${franchise.id}/store/${store.id}`, 'DELETE');
  }

  async docs(docType: string): Promise<Endpoints> {
    if (docType === 'factory') {
      return this.callEndpoint(pizzaFactoryUrl + `/api/docs`);
    }
    return this.callEndpoint(`/api/docs`);
  }
}

const httpPizzaService = new HttpPizzaService();
export default httpPizzaService;
