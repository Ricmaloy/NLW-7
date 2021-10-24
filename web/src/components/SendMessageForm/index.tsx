import { FormEvent, useState } from 'react';
import { VscGithubInverted, VscSignOut } from 'react-icons/vsc'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api';
import RocketSeal from '../../assets/seal.svg';
import styles from './styles.module.scss'

export function SendMessageForm() {
    const { user, signOut } = useAuth();
    const [message, setMessage] = useState('');

    async function handleSubmitMessage(ev: FormEvent) {
        ev.preventDefault();

        if(!message.trim()) return;

        await api.post('messages', { message });

        setMessage('');
    }

    return (
        <div className={styles.sendMessageFormWrapper}>
            <button onClick={signOut} className={styles.signOutButton}>
                <VscSignOut size={32}/>
            </button>

            <div className={styles.rocketSeal}>
                <img src={RocketSeal} alt="Selo Rocketseat" />
            </div>

            <header className={styles.userInformation}>
                <div className={styles.userImage}>
                    <img src={user?.avatar_url} alt={user?.name} />
                </div>
                <strong className={styles.userName}>{user?.name}</strong>
                <span className={styles.userGithub}>
                    <VscGithubInverted size={16} />
                    {user?.login}
                </span>
            </header>
            <form 
                className={styles.sendMessageForm}
                onSubmit={handleSubmitMessage}
            >
                <label htmlFor='message'>Mensagem</label>
                <textarea 
                    name='message' 
                    id='message'
                    placeholder='Qual sua expectativa para o evento?'
                    value={message}
                    onChange={event => setMessage(event.target.value)}
                />
                <button type='submit' >Enviar mensagem</button>
            </form>
        </div>
    )
}