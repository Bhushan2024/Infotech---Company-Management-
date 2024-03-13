document.addEventListener("DOMContentLoaded", () => {
    const applyButtons = document.querySelectorAll(".apply-button");
    const applicationSection = document.getElementById("application-section");
    const jobTitleElement = document.getElementById("job-title");

    applyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const jobTitle = button.getAttribute("data-job");
            jobTitleElement.textContent = jobTitle;
            displayApplicationForm();
        });
    });

    function displayApplicationForm() {
        applicationSection.classList.remove("hidden");
    }
});
