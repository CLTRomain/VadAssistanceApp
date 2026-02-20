var ip = "localhost"; 
var port = "8888"


export const Login = async (email, password) => {

  try {
    // ⚠️ Remplace par l'IP de ton serveur ou l'URL de ton API
    // Si tu testes sur un simulateur iOS : use 127.0.0.1
    // Si tu testes sur un appareil physique ou Android : utilise l'IP de ton PC
const API_URL = `http://${ip}:${port}/login`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const result = await response.json();

    console.log('Réponse du serveur:', result);

    if (result.success) {
      console.log('Connexion réussie !', result.data);
      // Ici, tu pourrais stocker le jeton de session et rediriger
      return result; // Retourne le résultat pour que le composant login.tsx puisse l'utiliser
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
    alert('Impossible de contacter le serveur.');
  }
};