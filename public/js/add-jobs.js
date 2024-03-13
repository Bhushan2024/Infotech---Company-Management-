document.addEventListener("DOMContentLoaded", () => {
    const skillsDropdown = document.getElementById("skillsDropdown");
    const selectedSkillsContainer = document.getElementById("selectedSkills");
    const selectedSkillsInput = document.getElementById("selectedSkillsInput"); // Hidden input field for selected skills

    skillsDropdown.addEventListener("change", (event) => {
        const selectedSkill = event.target.value;
        if (selectedSkill) {
            addSkillToSelected(selectedSkill);
        }
    });

    function addSkillToSelected(skillId) {
        const skillName = skillsDropdown.querySelector(`[value="${skillId}"]`).textContent;

        // Update hidden input field value with all selected skill names
        const selectedSkills = Array.from(selectedSkillsContainer.querySelectorAll('.selected-skill')).map(skillDiv => skillDiv.textContent);
        selectedSkillsInput.value = selectedSkills.join(", ");

        // Create div to display selected skill
        const selectedSkillDiv = document.createElement("div");
        selectedSkillDiv.classList.add("selected-skill");
        selectedSkillDiv.textContent = skillName;

        // Create span for remove icon
        const removeIcon = document.createElement("span");
        removeIcon.classList.add("remove-icon");
        removeIcon.textContent = " ×";
        removeIcon.addEventListener("click", () => {
            // Remove div when skill is removed
            selectedSkillDiv.remove();
            
            // Update hidden input field value after removing the skill
            const updatedSkills = Array.from(selectedSkillsContainer.querySelectorAll('.selected-skill')).map(skillDiv => skillDiv.textContent);
            selectedSkillsInput.value = updatedSkills.join(", ");
        });

        // Append remove icon to selected skill div
        selectedSkillDiv.appendChild(removeIcon);

        // Append selected skill div to the container
        selectedSkillsContainer.appendChild(selectedSkillDiv);

        // Update input field with selected skills
        selectedSkillsInput.value = Array.from(selectedSkillsContainer.querySelectorAll('.selected-skill')).map(skillDiv => skillDiv.textContent).join(", ");
    }
});




















// document.addEventListener("DOMContentLoaded", () => {
//     const skillsDropdown = document.getElementById("skillsDropdown");
//     const selectedSkillsContainer = document.getElementById("selectedSkills");

//     skillsDropdown.addEventListener("change", (event) => {
//         const selectedSkill = event.target.value;
//         if (selectedSkill) {
//             addSkillToSelected(selectedSkill);
//         }
//     });

//     function addSkillToSelected(skillId) {
//         const skillName = skillsDropdown.querySelector(`[value="${skillId}"]`).textContent;
        
//         const hiddenInput = document.createElement("input");
//         hiddenInput.type = "hidden";
//         hiddenInput.name = "selectedSkills[]";
//         hiddenInput.value = skillId;

//         document.getElementById("addJobForm").appendChild(hiddenInput);

//         const selectedSkillDiv = document.createElement("div");
//         selectedSkillDiv.classList.add("selected-skill");
//         selectedSkillDiv.textContent = skillName;

//         const removeIcon = document.createElement("span");
//         removeIcon.classList.add("remove-icon");
//         removeIcon.textContent = " ×";
//         removeIcon.addEventListener("click", () => {
//             hiddenInput.remove();
//             selectedSkillDiv.remove();
//         });

//         selectedSkillDiv.appendChild(removeIcon);

//         selectedSkillsContainer.appendChild(selectedSkillDiv);
//     }
// });


// function submitForm() {
//     alert("Form Submitted");

//     const selectedSkills = document.querySelectorAll(".selected-skill");
//     selectedSkills.forEach(skill => {
//         const skillValue = skill.textContent.trim();
//         const hiddenInput = document.createElement("input");
//         hiddenInput.type = "hidden";
//         hiddenInput.name = "selectedSkills[]";
//         hiddenInput.value = skillValue;
//         document.getElementById("addJobForm").appendChild(hiddenInput);
//     });

//     var formData = new FormData(document.getElementById("addJobForm"));

//     fetch("/auth/addjob", {
//         method: "POST",
//         body: formData
//     })
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             }
//             throw new Error("Network response was not ok.");
//         })
//         .then(data => {
//             console.log(data);
//         })
//         .catch(error => {
//             console.error("There was a problem with your fetch operation:", error);
//         });
// }
