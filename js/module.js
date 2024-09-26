document.addEventListener("DOMContentLoaded", () => {
  // Function to generate the image URLs for additional images
  function generateAdditionalImages(type, baseSrc, chapter, subjectCode, index) {
      const images = [];
      images.push(`${baseSrc} ${index}.png`);
      images.push(`${baseSrc} ${index}b.png`);
      images.push(`${baseSrc} ${index}c.png`);
      return images;
  }

  // Function to generate tutorial questions
  function generateQuestions(type, numQuestions, subjectCode, chapter, additionalImages) {
      const questions = [];
      const imageTypes = {
          'textbook': 'T',
          'lectures': 'L',
          'tutorials': 'C'
      };

      const baseSrc = `Images/C${chapter}/${subjectCode}, ${imageTypes[type]}${chapter}, image`;
      
      for (let i = 1; i <= numQuestions; i++) {
          if (additionalImages.includes(i)) {
              questions.push({
                  question: i,
                  src: generateAdditionalImages(type, baseSrc, chapter, subjectCode, i)
              });
          } else {
              // Normal case
              questions.push({
                  question: i,
                  src: [`${baseSrc} ${i}.png`]
              });
          }
      }
      return questions;
  }

  // Function to populate accordion content
  function populateAccordionContent(data) {
      const accordions = document.querySelectorAll(".accordion-content");

      accordions.forEach(acc => {
          const type = acc.getAttribute("data-type");
          const items = data[type] || [];

          if (items.length === 0) {
              acc.innerHTML = "<p>Content is empty.</p>"; // Display message when content is empty
          } else {
              items.forEach(item => {
                  const questionElement = document.createElement("h1");
                  questionElement.textContent = `Question ${item.question}`;
                  acc.appendChild(questionElement);

                  // Handle multiple images
                  item.src.forEach(src => {
                      const imgElement = document.createElement("img");
                      imgElement.src = src;
                      acc.appendChild(imgElement);
                  });
              });
          }
      });
  }

  // Read configuration from the content-config div
  const configElement = document.getElementById("content-config");
  const subjectCode = configElement.getAttribute("data-subject-code");
  const chapter = configElement.getAttribute("data-chapter");
  const numQuestionsTextbook = parseInt(configElement.getAttribute("data-questions-textbook"), 10);
  const numQuestionsNotes = parseInt(configElement.getAttribute("data-questions-notes"), 10);
  const numQuestionsTutorials = parseInt(configElement.getAttribute("data-questions-tutorials"), 10);

  // Read additional images configuration
  const additionalImagesStr = configElement.getAttribute("data-additional-images");
  const additionalImages = additionalImagesStr ? additionalImagesStr.split(',').map(Number) : [];

  // Example data based on configuration
  const content = {
      'textbook': generateQuestions('textbook', numQuestionsTextbook, subjectCode, chapter, additionalImages),
      'lectures': generateQuestions('lectures', numQuestionsNotes, subjectCode, chapter, additionalImages),
      'tutorials': generateQuestions('tutorials', numQuestionsTutorials, subjectCode, chapter, additionalImages)
  };

  populateAccordionContent(content);
});
