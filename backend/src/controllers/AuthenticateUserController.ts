import { Request, Response } from 'express';
import { AuthenticateUserService } from '../services/AuthenticateUserService';

class AuthenticateUserController {
    async handle(request: Request, response: Response) {
        const { code, serviceType } = request.body;

        const service = new AuthenticateUserService();

        try { 
            if(serviceType == 'web' || serviceType == undefined) {
                const result = await service.execute(code, 'web');
                return response.json(result);
            }
            if(serviceType == 'mobile') {
                const result = await service.execute(code, 'mobile');
                return response.json(result);
            }
        } catch(err) {
            return response.json({ error: err.message });
        }


    }
}

export { AuthenticateUserController }