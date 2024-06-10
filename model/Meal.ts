class Meal {
    id: any;
    name: any;
    calories: any;
    protein: any;
    carbs: any;
    fat: any;
    cookingTime: any;
    ingredients: any;
    cookingProcess: any;

    constructor(id: any, name: any, calories: any, protein: any, carbs: any, fat: any, cookingTime: any, ingredients: any, cookingProcess: any) {
        this.id = id;
        this.name = name;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
        this.cookingTime = cookingTime;
        this.ingredients = ingredients;
        this.cookingProcess = cookingProcess;
    }
}

export default Meal;
