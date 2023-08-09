// Elements
const sidebarBtns = document.querySelectorAll(".sidebar__step__btn");
const formSectionsWrapper = document.querySelector(".form-sections");
const formSections = document.querySelectorAll(".form-section");
const sectionControls = document.querySelector(".section-controls");
const controlsNextBtn = sectionControls.querySelector(".section-controls__next-btn");
const controlsPreviousBtn = sectionControls.querySelector(".section-controls__prev-btn");

const mainFormInputs = document.querySelectorAll(".form-section__content form input");

const plansCardsWrapper = document.querySelector(".form-section__cards");
const plansCards = [];
const planContorls = document.querySelector(".form-section__controls");
const planDurationBtn = planContorls.querySelector("button.form-section__controls__btn");

const addOnsCheckboxes = [];
const addOnsElementsWrapper = document.querySelector(".form-section[data-order='3'] .form-section__content");

const overviewPlanTitle = document.querySelector(".overview__plan .overview__plan__title");
const overviewPlanPrice = document.querySelector(".overview__plan .overview__plan__price");
const overviewAddOnsWrapper = document.querySelector(".overview__add-ons");
const overviewFooterPlanDuration = document.querySelector(".overview__footer__plan-duration");
const overviewFooterTotalPrice = document.querySelector(".overview__footer__total-price");
const overviewChangeSectionBtn = document.querySelector(".overview__plan .overview__plan__btn");


// Global Variables
let formSubmitted = false;

const sectionsNumber = formSections.length;
let currentSection = 1;

let currentPlan = {
  currentPlanName: null,
  currentPlanDuration: "monthly",
};


const planKeywords = {
  monthly: ["month", "mo", "pricePerMonth"],
  yearly: ["year", "yr", "pricePerYear"]
}

let plansData = [];
let addOnsData = [];

let addOnsIncluded = [];

class createPlanObject {
  constructor(planName, pricePerMonth, pricePerYear, gift, associatedPriceElement, associatedGiftElement) {

    this.planName = planName;
    this.pricePerMonth = pricePerMonth;
    this.pricePerYear = pricePerYear;
    this.gift = gift;
    this.associatedPriceElement = associatedPriceElement;
    this.associatedGiftElement = associatedGiftElement;


  }

}

class createAddOnObject {
  constructor(addOnName, pricePerMonth, pricePerYear, associatedPriceElement) {

    this.addOnName = addOnName;
    this.pricePerMonth = pricePerMonth;
    this.pricePerYear = pricePerYear;
    this.associatedPriceElement = associatedPriceElement;


  }
}


fetch("./data/data.json")
  .then(async (formData) => await formData.json())
  .then(formData => {

    addPlansToDocument(formData[0]);
    addAddOnsToDocument(formData[1]);

    addEventListenerToPlans();
    addEventListenerToCheckboxes();

    setCurrentPlan();
    updateTotalPrice();

  });

function addPlansToDocument(plans) {

  let planElement = document.createElement("div");
  planElement.className = "form-section__card";

  for (let i = 0; i < plans.length; i++) {

    let planData = plans[i];
    let planName = planData.planName;

    let planElementCloned = planElement.cloneNode(true);

    planElementCloned.setAttribute("data-plan", planName);

    if (i == 0) {

      planElementCloned.classList.add("js-selected");
      currentPlan.currentPlanName = planName;

    }

    planElementCloned.innerHTML =
      `
      <div class="form-section__card__icon">
        ${planData.svg}
      </div>
      <div class="form-section__card__content l-grid-spacer" style="--gap: .125rem">
        <h2 class="form-section__card__title c-title">
          ${planName}
        </h2>
        <p class="form-section__card__price">
          ${getPrice.call(planData)}
        </p>
        <p class="form-section__card__gift u-marker-dark">
          ${planData.gift}
        </p>
      </div>
    `

    plansData
      .push(new createPlanObject(
        planName,
        planData.pricePerMonth,
        planData.pricePerYear,
        planData.gift,
        planElementCloned.querySelector(".form-section__card__price"),
        planElementCloned.querySelector(".form-section__card__gift")
      ));

    plansCards.push(planElementCloned)
    plansCardsWrapper.appendChild(planElementCloned);



  }

}

function addAddOnsToDocument(addOns) {

  let addOnElement = document.createElement("div");
  addOnElement.className = "add-on"

  for (let addOnData of addOns) {

    let addOnName = addOnData.addOnName;
    let addOnNameForUser = addOnName.replace("-", " ");

    let addOnElementCloned = addOnElement.cloneNode(true);
    addOnElementCloned.setAttribute("data-add-on", addOnName);

    addOnElementCloned.innerHTML =
      `
      <div class="add-on__checkbox">
        <label for="${addOnName}" class="u-sr-only">${addOnNameForUser}</label>
        <input type="checkbox" id="${addOnName}">
      </div>
      <div class="add-on__details l-grid-spacer" style="--gap: .25rem" data-desktop-grow>
        <h3 class="add-on__title c-title">${addOnNameForUser}</h3>
        <p class="add-on__description">${addOnData.addOnDescription}</p>
      </div>
      <span class="add-on__price u-marker-light">${getPrice.call(addOnData)}</span>
    `


    addOnsData
      .push(new createAddOnObject(
        addOnName,
        addOnData.pricePerMonth,
        addOnData.pricePerYear,
        addOnElementCloned.querySelector(".add-on__price")
      ));

    addOnsCheckboxes.push(addOnElementCloned.querySelector("input"))
    addOnsElementsWrapper.appendChild(addOnElementCloned);

  }

}

function addEventListenerToPlans() {

  plansCards.forEach(card => {

    card.addEventListener("click", () => {

      plansCards.forEach(card => card.classList.remove("js-selected"));

      card.classList.add("js-selected");

      currentPlan.currentPlanName = card.getAttribute("data-plan");

      setCurrentPlan()

      updateTotalPrice();

    });


  });

}

function addEventListenerToCheckboxes() {

  for (let checkbox of addOnsCheckboxes) {

    checkbox.addEventListener("click", () => {

      let parentElement = checkbox.closest(".add-on")
      let addOnName = parentElement.getAttribute("data-add-on");

      if (checkbox.checked) {

        addOnsIncluded.push(addOnName);

        parentElement.classList.add("js-selected");
        overviewAddOnsWrapper.classList.remove("js-no-add-ons")

        addOverviewAddOn(addOnName)

      } else {

        parentElement.classList.remove("js-selected");

        addOnsIncluded.splice(addOnsIncluded.indexOf(addOnName), 1);

        if (addOnsIncluded.length == 0) overviewAddOnsWrapper.classList.add("js-no-add-ons");

        for (let addOn of addOnsData) {

          if (addOn.addOnName == addOnName) {

            addOn.associatedAddOnElement.remove();
            addOn.associatedAddOnElement = null;

          }

        }
      }

      updateTotalPrice();

    });

  }

}

function addOverviewAddOn(addOnName) {

  let newAddOn = document.createElement("div");
  newAddOn.classList.add("overview__add-on", "l-flex-between", "overview__row");

  for (let addOn of addOnsData) {

    if (addOn.addOnName == addOnName) {

      let newAddOnCloned = newAddOn.cloneNode(true);
      newAddOnCloned.setAttribute("data-add-on", addOnName);

      newAddOnCloned.innerHTML =
        `
      <span class="u-fl-capitalize">
        ${addOnName.replace("-", " ")}
      </span>
      <span class="u-marker-dark">
        ${getPrice.call(addOn)}
      </span>
    `

      addOn.associatedAddOnElement = newAddOnCloned;
      overviewAddOnsWrapper.appendChild(newAddOnCloned);
      break;
    }
  }

}


for (let btn of sidebarBtns) {

  btn.addEventListener
    ("click",
      _ => showUpSection(Number(btn.closest(".sidebar__step").getAttribute("data-order"))));

}

controlsNextBtn.addEventListener("click", () => showUpSection(currentSection + 1));
controlsPreviousBtn.addEventListener("click", () => showUpSection(currentSection - 1));
overviewChangeSectionBtn.addEventListener("click", () => showUpSection(2));


function showUpSection(targetedSectionOrder) {

  if
    (targetedSectionOrder == currentSection
    || formSubmitted
    || targetedSectionOrder < 1
    || (currentSection == 1 && !ValidateForm(mainFormInputs))) return;


  if (targetedSectionOrder == sectionsNumber) {

    sectionControls.classList.add("js-hidden");
    formSubmitted = true;

  } else {
    sectionControls.classList.remove("js-hidden");
    manageControlBtns(targetedSectionOrder)

  }

  formSectionsWrapper.classList.add("js-blur");
  formSectionsWrapper.ontransitionend = (e) => {
    if (e.propertyName == "filter") {

      for (let section of formSections) {

        section.classList.remove("js-current");

        if
          (section.getAttribute("data-order") == targetedSectionOrder) section.classList.add("js-current");

      }

      formSectionsWrapper.classList.remove("js-blur");
      currentSection = targetedSectionOrder;

    }
  }

}

function manageControlBtns(targetedSectionOrder) {


  controlsPreviousBtn.classList.remove("js-show-up");
  if (targetedSectionOrder !== 1) controlsPreviousBtn.classList.add("js-show-up");

  controlsNextBtn.textContent = "next step";
  if (targetedSectionOrder == 4) controlsNextBtn.textContent = "confirm";

  for (let btn of sidebarBtns) {

    let parentElement = btn.closest(".sidebar__step");
    parentElement.classList.remove("js-current");

    if (parentElement.getAttribute("data-order") == targetedSectionOrder)
      parentElement.classList.add("js-current");

  }

}

mainFormInputs.forEach(input => input.addEventListener("focusout", () => ValidateForm([input])));

function ValidateForm(arrayOfInputs) {

  for (input of arrayOfInputs) {

    let parentElement = input.closest("div");
    let inputValue = input.value;

    if (inputValue == "") {

      parentElement.querySelector("p.validation-message")
        .textContent = "This field is required"

      parentElement.classList.add("js-invalid");

      return false;

    }

    let inputType = input.getAttribute("data-type");

    if ((inputType == "name" && !/[A-ZÀ-ÿ-,a-z\.'\s]+/g.test(inputValue))
      || (inputType == "email address" && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(inputValue))
      || (inputType == "phone number" && !/^[+]*\({0,1}[0-9]{1,4}\){0,1}[-\s\./0-9]*$/g.test(inputValue))) {

      parentElement.querySelector("p.validation-message")
        .textContent = `Invalid ${inputType}`;

      parentElement.classList.add("js-invalid");

      return false;

    }

    parentElement.classList.remove("js-invalid");


  }

  return true;

}


planDurationBtn.addEventListener("click", () => {

  if (currentPlan.currentPlanDuration == "monthly") {

    planContorls.classList.add("js-yearly-plan");
    currentPlan.currentPlanDuration = "yearly"

  } else {

    planContorls.classList.remove("js-yearly-plan");
    currentPlan.currentPlanDuration = "monthly"

  }

  overviewPlanTitle.textContent = `${currentPlan.currentPlanName} (${currentPlan.currentPlanDuration})`

  for (let planData of plansData) {

    let planPrice = getPrice.call(planData);

    planData.associatedPriceElement.textContent = planPrice;
    planData.associatedGiftElement.textContent = planData.gift;

    if (planData.planName == currentPlan.currentPlanName) {
      overviewPlanPrice.textContent = planPrice;
    }

  }

  let overveiwAddOns = Array.from(overviewAddOnsWrapper.children);

  for (let addOn of addOnsData) {

    let addOnprice = getPrice.call(addOn);

    addOn.associatedPriceElement.textContent = addOnprice;

    for (let overveiwAddOn of overveiwAddOns) {

      if (overveiwAddOn.getAttribute("data-add-on") == addOn.addOnName)
        overveiwAddOn.querySelector("span:last-child").textContent = addOnprice;
    }

  }

  updateTotalPrice();

});






function updateTotalPrice() {

  let currentPlanPrice = getPrice.call(currentPlan, true);
  let addOnsPrice = 0;

  for (let addOn of addOnsData) {

    if (addOn.associatedAddOnElement) {
      addOnsPrice += getPrice.call(addOn, true);
    }

  }

  overviewFooterPlanDuration.textContent = planKeywords[currentPlan.currentPlanDuration][0];
  overviewFooterTotalPrice.textContent = `$${currentPlanPrice + addOnsPrice}/${planKeywords[currentPlan.currentPlanDuration][1]}`;

}


function getPrice(getNumberOnly) {
  if (getNumberOnly) {
    return this[planKeywords[currentPlan.currentPlanDuration][2]];
  } else {
    return `$${this[planKeywords[currentPlan.currentPlanDuration][2]]}/${planKeywords[currentPlan.currentPlanDuration][1]}`
  }
}

function setCurrentPlan() {

  plansData.forEach(priceObj => {
    if (priceObj.planName == currentPlan.currentPlanName) {
      currentPlan.pricePerMonth = priceObj.pricePerMonth;
      currentPlan.pricePerYear = priceObj.pricePerYear;
    }
  });

  overviewPlanTitle.textContent = `${currentPlan.currentPlanName} (${currentPlan.currentPlanDuration})`
  overviewPlanPrice.textContent = getPrice.call(currentPlan);

}
