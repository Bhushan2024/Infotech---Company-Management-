

document.addEventListener("DOMContentLoaded", () => {
    const skillsDropdown = document.getElementById("skillsDropdown");
    const selectedSkillsContainer = document.getElementById("selectedSkills");
    const selectedSkillsInput = document.getElementById("selectedSkillsInput");

    skillsDropdown.addEventListener("change", (event) => {
        const selectedSkill = event.target.value;
        if (selectedSkill) {
            addSkillToSelected(selectedSkill);
        }
    });

    function addSkillToSelected(skillName) {
        // Check if skill is already selected
        if (selectedSkillsInput.value.includes(skillName)) {
            return;
        }

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
            updateSelectedSkillsInput();
        });

        // Append remove icon to selected skill div
        selectedSkillDiv.appendChild(removeIcon);

        // Append selected skill div to the container
        selectedSkillsContainer.appendChild(selectedSkillDiv);

        updateSelectedSkillsInput();
    }

    function updateSelectedSkillsInput() {
        selectedSkillsInput.value = Array.from(selectedSkillsContainer.querySelectorAll('.selected-skill')).map(skillDiv => skillDiv.textContent).join(", ");
    // Update hidden input field with selected skills
    document.getElementById("selectedCandidatesInput").value = selectedSkillsInput.value;
    }
});















// document.addEventListener("DOMContentLoaded", () => {
//     const skillsDropdown = document.getElementById("skillsDropdown");
//     const selectedSkillsContainer = document.getElementById("selectedSkills");
//     const selectedSkillsInput = document.getElementById("selectedSkillsInput"); // Hidden input field for selected skills

//     skillsDropdown.addEventListener("change", (event) => {
//         const selectedSkill = event.target.value;
//         if (selectedSkill) {
//             addSkillToSelected(selectedSkill);
//         }
//     });

//     function addSkillToSelected(skillId) {
//         const skillOption = skillsDropdown.querySelector(`[value="${skillId}"]`);
//         const skillName = skillOption.textContent;

//         if (selectedSkillsContainer.querySelector(`[data-skill-id="${skillId}"]`)) {
//             return; // Do nothing if the skill is already selected
//         }

//         const selectedSkillDiv = document.createElement("div");
//         selectedSkillDiv.classList.add("selected-skill");
//         selectedSkillDiv.dataset.skillId = skillId;
//         selectedSkillDiv.textContent = skillName;

//         const removeIcon = document.createElement("span");
//         removeIcon.classList.add("remove-icon");
//         removeIcon.textContent = " ×";
//         removeIcon.addEventListener("click", () => {
//             selectedSkillDiv.remove();
//             updateSelectedSkillsInput();
//         });
//         selectedSkillDiv.appendChild(removeIcon);
//         selectedSkillsContainer.appendChild(selectedSkillDiv);
//         updateSelectedSkillsInput();
//     }

//     function updateSelectedSkillsInput() {
//         const selectedSkills = Array.from(selectedSkillsContainer.querySelectorAll('.selected-skill')).map(skillDiv => skillDiv.dataset.skillId);
//         selectedSkillsInput.value = selectedSkills.join(", ");
//     }
// });










