// Variables globales
let questionCourante = 0;
let reponsesUtilisateur = [];
let score = 0;

// Sélection des éléments du DOM
const ecranAccueil = document.getElementById("ecran-accueil");
const interfaceQuiz = document.getElementById("interface-quiz");
const resultatFinal = document.getElementById("resultat-final");

const btnCommencer = document.getElementById("btn-commencer");
const btnPrecedent = document.getElementById("btn-precedent");
const btnSuivant = document.getElementById("btn-suivant");
const btnValider = document.getElementById("btn-valider");
const btnRecommencer = document.getElementById("btn-recommencer");

const questionTitre = document.getElementById("question-titre");
const optionsContainer = document.getElementById("options-container");
const scoreElement = document.getElementById("score-final");
const messageResultat = document.getElementById("message-resultat");
const resumeQuestions = document.getElementById("resume-questions");
const barreProgression = document.getElementById("barre-progression");

// Local Storage Keys
const LS_QUESTION_COURANTE = "quiz_question_courante";
const LS_REPONSES = "quiz_reponses";
const LS_QUIZ_EN_COURS = "quiz_en_cours";

// Événements
document.addEventListener("DOMContentLoaded", initialiserQuiz);
btnCommencer.addEventListener("click", commencerQuiz);
btnSuivant.addEventListener("click", questionSuivante);
btnPrecedent.addEventListener("click", questionPrecedente);
btnValider.addEventListener("click", validerQuiz);
btnRecommencer.addEventListener("click", recommencerQuiz);

// Fonctions
function initialiserQuiz() {
    // Vérifier si un quiz est en cours
    const quizEnCours = localStorage.getItem(LS_QUIZ_EN_COURS);
    
    if (quizEnCours === "true") {
        // Récupérer la question courante
        const savedQuestion = localStorage.getItem(LS_QUESTION_COURANTE);
        if (savedQuestion !== null) {
            questionCourante = parseInt(savedQuestion);
        }
        
        // Récupérer les réponses utilisateur
        const savedReponses = localStorage.getItem(LS_REPONSES);
        if (savedReponses !== null) {
            reponsesUtilisateur = JSON.parse(savedReponses);
        } else {
            reponsesUtilisateur = Array(questions.length).fill("");
        }
        
        // Afficher l'interface du quiz
        ecranAccueil.classList.add("d-none");
        interfaceQuiz.classList.remove("d-none");
        afficherQuestion();
    }
}

function sauvegarderEtat() {
    localStorage.setItem(LS_QUESTION_COURANTE, questionCourante);
    localStorage.setItem(LS_REPONSES, JSON.stringify(reponsesUtilisateur));
    localStorage.setItem(LS_QUIZ_EN_COURS, "true");
}

function commencerQuiz() {
    ecranAccueil.classList.add("d-none");
    interfaceQuiz.classList.remove("d-none");
    reponsesUtilisateur = Array(questions.length).fill("");
    questionCourante = 0;
    sauvegarderEtat();
    afficherQuestion();
}

function afficherQuestion() {
    // Mise à jour du titre de la question
    questionTitre.textContent = `Question ${questionCourante + 1}: ${questions[questionCourante].question}`;
    
    // Vider le conteneur d'options
    optionsContainer.innerHTML = "";
    
    // Afficher les options selon le type de question
    if (questions[questionCourante].type === "choix_multiple") {
        questions[questionCourante].options.forEach((option, index) => {
            const button = document.createElement("button");
            button.textContent = option;
            button.className = "option-btn";
            if (reponsesUtilisateur[questionCourante] === option) {
                button.classList.add("option-selected");
            }
            button.addEventListener("click", () => selectionnerOption(option));
            optionsContainer.appendChild(button);
        });
    } else if (questions[questionCourante].type === "texte") {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "text-input";
        input.placeholder = "Votre réponse...";
        input.value = reponsesUtilisateur[questionCourante];
        input.addEventListener("input", (e) => {
            reponsesUtilisateur[questionCourante] = e.target.value;
            sauvegarderEtat();
        });
        optionsContainer.appendChild(input);
    }
    
    // Mise à jour des boutons de navigation
    btnPrecedent.disabled = questionCourante === 0;
    
    if (questionCourante === questions.length - 1) {
        btnSuivant.classList.add("d-none");
        btnValider.classList.remove("d-none");
    } else {
        btnSuivant.classList.remove("d-none");
        btnValider.classList.add("d-none");
    }
    
    // Mise à jour de la barre de progression
    const progression = ((questionCourante + 1) / questions.length) * 100;
    barreProgression.style.width = `${progression}%`;
    barreProgression.setAttribute("aria-valuenow", progression);
    
    // Sauvegarde de l'état
    sauvegarderEtat();
}

function selectionnerOption(option) {
    reponsesUtilisateur[questionCourante] = option;
    
    // Mise à jour visuelle des boutons d'options
    const optionButtons = optionsContainer.querySelectorAll(".option-btn");
    optionButtons.forEach(button => {
        if (button.textContent === option) {
            button.classList.add("option-selected");
        } else {
            button.classList.remove("option-selected");
        }
    });
    
    // Sauvegarde de l'état
    sauvegarderEtat();
}

function questionSuivante() {
    if (questionCourante < questions.length - 1) {
        questionCourante++;
        afficherQuestion();
    }
}

function questionPrecedente() {
    if (questionCourante > 0) {
        questionCourante--;
        afficherQuestion();
    }
}

function validerQuiz() {
    calculerScore();
    // Effacer les données du quiz en cours
    effacerDonneesQuiz();
    afficherResultats();
}

function calculerScore() {
    score = 0;
    reponsesUtilisateur.forEach((reponse, index) => {
        const reponseCorrecte = questions[index].reponseCorrecte;
        
        // Vérification de la réponse
        if (questions[index].type === "texte") {
            // Pour les questions texte, on fait une comparaison sans tenir compte de la casse
            if (reponse.trim().toLowerCase() === reponseCorrecte.toLowerCase()) {
                score++;
            }
        } else {
            // Pour les questions à choix multiple
            if (reponse === reponseCorrecte) {
                score++;
            }
        }
    });
}

function afficherResultats() {
    interfaceQuiz.classList.add("d-none");
    resultatFinal.classList.remove("d-none");
    
    // Affichage du score
    const scorePercentage = Math.round((score / questions.length) * 100);
    scoreElement.textContent = `${score}/${questions.length} (${scorePercentage}%)`;
    
    // Message personnalisé selon le score
    if (scorePercentage >= 80) {
        messageResultat.textContent = "🤓";
    } else if (scorePercentage >= 60) {
        messageResultat.textContent = "Not bad !";
    } else if (scorePercentage >= 40) {
        messageResultat.textContent = "Meh";
    } else {
        messageResultat.textContent = "🥲";
    }
    
    // Affichage du résumé des questions
    resumeQuestions.innerHTML = "";
    questions.forEach((q, index) => {
        const questionElement = document.createElement("div");
        questionElement.className = "question-resume";

        const reponseUtilisateur = reponsesUtilisateur[index] || "Non répondue";
        const reponseCorrecte = q.reponseCorrecte;
        const estCorrecte = 
            q.type === "texte" 
                ? reponseUtilisateur.trim().toLowerCase() === reponseCorrecte.toLowerCase()
                : reponseUtilisateur === reponseCorrecte;

        questionElement.classList.add(estCorrecte ? "reponse-correcte" : "reponse-incorrecte");

        let message;
        if (reponseUtilisateur === "Non répondue") {
            message = "❗ Vous n'avez pas répondu à cette question.";
        } else if (estCorrecte) {
            message = "✅ Yes sir";
        } else {
            message = "❌";
        }

        questionElement.innerHTML = `
            <h5>Question ${index + 1}: ${q.question}</h5>
            <p><strong>Votre réponse:</strong> ${reponseUtilisateur}</p>
            <p><strong>Réponse correcte:</strong> ${reponseCorrecte}</p>
            <p>${message}</p>
        `;

        resumeQuestions.appendChild(questionElement);
    });
    
    // Sauvegarde du meilleur score dans le localStorage
    sauvegarderMeilleurScore(scorePercentage);
}

function sauvegarderMeilleurScore(scorePercentage) {
    const meilleurScore = localStorage.getItem("quiz_meilleur_score") || 0;
    if (scorePercentage > meilleurScore) {
        localStorage.setItem("quiz_meilleur_score", scorePercentage);
    }
}

function recommencerQuiz() {
    effacerDonneesQuiz();
    resultatFinal.classList.add("d-none");
    ecranAccueil.classList.remove("d-none");
}

function effacerDonneesQuiz() {
    // Réinitialiser les variables
    questionCourante = 0;
    reponsesUtilisateur = Array(questions.length).fill("");
    score = 0;
    
    // Supprimer les données du localStorage (sauf le meilleur score)
    localStorage.removeItem(LS_QUESTION_COURANTE);
    localStorage.removeItem(LS_REPONSES);
    localStorage.removeItem(LS_QUIZ_EN_COURS);
}