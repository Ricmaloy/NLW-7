
import axios from 'axios';
import prismaClient from '../prisma';
import { sign } from 'jsonwebtoken';

/*
*  Receber code (string)
*  Recuperar access_token no github
*  Recuperar infos do usuario
*  Verificar se o usuário existe no DB
*  ---- SIM = Gera um token
*  ---- NAO = Cria no DB, gera um token
*  Retornar o token com as infos do user
*/

interface IAccessTokenResponse {
    access_token: string;
}

interface IUserResponde {
    avatar_url: string,
    login: string,
    id: number,
    name: string,
}

class AuthenticateUserService {
    async execute(code: string, serviceType: 'web' | 'mobile' = 'web') {
        console.log("Server: User authentication, serviceType: " + serviceType);

        const url = 'https://github.com/login/oauth/access_token';

        const envServiceTypes_CLIENT_ID = {
            web: process.env.GITHUB_WEB_CLIENT_ID,
            mobile: process.env.GITHUB_MOBILE_CLIENT_ID
        }
        
        const envServiceTypes_CLIENT_SECRET = {
            web: process.env.GITHUB_WEB_CLIENT_SECRET,
            mobile: process.env.GITHUB_MOBILE_CLIENT_SECRET
        }
      
        const CLIENT_ID = envServiceTypes_CLIENT_ID[serviceType]
        const CLIENT_SECRET = envServiceTypes_CLIENT_SECRET[serviceType]
      

        const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
            }, 
            headers: {
                "Accept": "application/json",
            }
        })

        const response = await axios.get<IUserResponde>('https://api.github.com/user', {
            headers: {
                authorization: `Bearer ${accessTokenResponse.access_token}`
            }
        })

        const { login, id, avatar_url, name } = response.data;

        let user = await prismaClient.user.findFirst({ 
            where: { 
                github_id: id
            }
        });

        if(!user) {
            user = await prismaClient.user.create({
                data: {
                    github_id: id,
                    login,
                    avatar_url,
                    name
                }
            })
        }

        const token = sign(
            {
                user: {
                    name: user.name,
                    avatar_url: user.avatar_url,
                    id: user.id,
                }
            },
            process.env.JWT_SECRET,
            {
                subject: user.id,
                expiresIn: "1d"
            }
        )

        return { token, user };
    }
}

export { AuthenticateUserService }