import './login.scss';
import { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/Auth';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AlertMesg from '../Utils/AlertMesg/AlertMesg';
import { Eye, EyeOff } from 'react-feather';
import { supabase } from '../../supabaseClient';

const Login = function () {
    const [error, setError] = useState(null);

    const [eyeIcon, setEyeIcon] = useState(true); // true -> Eye, false -> EyeOff

    // Get connexion function from the Auth context
    const { signIn } = useAuth();

    const history = useHistory();

    const schema = yup.object().shape({
        email: yup.string().email("Vérifier l'adresse mail, elle ne semble pas correcte.").required("Merci de renseigner votre adresse mail."),
        password: yup.string().required("Merci de saisir votre mot de passe."),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            'email': '',
            'password': '',
        },
        resolver: yupResolver(schema),
    });

    const onSubmit = async (values) => {
        // Get input values
        const email = values.email;
        const password = values.password;
        // Calls signIn function from the context
        const { user, error } = await signIn({ email, password });

        if (error) {
            console.log("Erreur signIn(): ", error);
            setError("Les informations fournies ne sont pas reconnues, vérifiez votre saisie.");
        } else {
            let isAdmin, prenom, nom;
            const getUser = async (user) => {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select()
                        .eq('id', user.id)
                        .single()
    
                    if (error) {
                        throw error;
                    }
    
                    if (data) {
                        isAdmin = data.is_admin;
                        if (isAdmin) {
                            prenom = data.prenom;
                            nom = data.nom;
                        }
                        (isAdmin)  ? console.log("je suis un admin") : console.log("je ne suis pas un admin")
                        if (prenom && nom) console.log(`je suis ${prenom} ${nom}`)
                    }
                } catch (error) {
                    console.warn("Erreur getUser: ", error)
                }
            }

            console.log("from login", user)
            getUser(user);
            history.push('/test');
        }
    }
    const onError = (errors) => {
        console.log("erreur onSubmit(): ", errors);
    }

    const showPassword = () => {
        setEyeIcon(!eyeIcon);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)}>

            {error &&
                <AlertMesg message={error} />
            }
            <div className="col mb-3">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                    {...register("email")}
                    className={`form-control ${error ? 'is-invalid':''}`}
                    type="email"
                />
                {errors.email &&
                    <AlertMesg message={errors.email?.message} />
                }
            </div>

            <div className="col mb-3">
                <label className="form-label" htmlFor="password">Mot de passe</label>
                <div className="input-group">
                    <input
                        {...register("password")}
                        className={`form-control ${error ? 'is-invalid':''}`}
                        type={eyeIcon ? "password" : "text"}
                    />
                    <span className="eye input-group-text" onClick={showPassword}>
                        {eyeIcon ? <Eye size={18} /> : <EyeOff size={18} />}
                    </span>
                </div>
                {errors.password &&
                    <AlertMesg message={errors.password?.message} />
                }
            </div>

            <div className="d-flex flex-column justify-content-center align-items-center">
                <button className="btn btn-primary mb-2" type="submit">Connexion</button>
                <p><Link to='/'>Retour à l'accueil</Link></p>
            </div>

        </form>
    )
}

export default Login;