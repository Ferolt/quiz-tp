
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

// Événements
btnCommencer.addEventListener("click", commencerQuiz);
btnSuivant.addEventListener("click", questionSuivante);
btnPrecedent.addEventListener("click", questionPrecedente);
btnValider.addEventListener("click", validerQuiz);
btnRecommencer.addEventListener("click", recommencerQuiz);

// Fonctions
function commencerQuiz() {
    ecranAccueil.classList.add("d-none");
    interfaceQuiz.classList.remove("d-none");
    reponsesUtilisateur = Array(questions.length).fill("");
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

}

function recommencerQuiz() {
    questionCourante = 0;
    reponsesUtilisateur = Array(questions.length).fill("");
    score = 0;
    
    resultatFinal.classList.add("d-none");
    ecranAccueil.classList.remove("d-none");
}