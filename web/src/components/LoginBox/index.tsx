import { VscGithubInverted } from 'react-icons/vsc';
import { useAuth } from '../../hooks/useAuth';
import RocketSeal from '../../assets/seal.svg';
import styles from './styles.module.scss';

export function LoginBox() {
    const { signInUrl } = useAuth();

    return (
        <div className={styles.loginBoxWrapper}>
            <div className={styles.rocketSeal}>
                <img src={RocketSeal} alt="Selo Rocketseat" />
            </div>

            <strong>Entre e compartilhe sua mensagem</strong>
            <a href={signInUrl} className={styles.signInWithGithub}>
                <VscGithubInverted size={24} />
                Entrar com github
            </a>
        </div>
    )
}