class Teacher {
    constructor(name, subjects, max_hours) {
        this.name = name;
        this.subjects = subjects;
        this.max_hours = max_hours;
    }
}

class Group {
    constructor(group_name, subjects_hours) {
        this.group_name = group_name;
        this.subjects_hours = subjects_hours;
    }
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const subjects = [
    "Math", "Physics",
    "Computer Science", "Programming",
];

const teachers = [
    new Teacher("John Doe", ["Math", "Physics"], 30),
    new Teacher("Eva Brown", ["Computer Science", "Programming"], 30),
    new Teacher("Daniel Davis", ["Math"], 18),
    new Teacher("Michael White", ["Programming"], 21),
    new Teacher("Liam Wilson", ["Computer Science"], 20),
    new Teacher("James Robinson", ["Physics"], 19),
    new Teacher("Emily Garcia", ["Math"], 25),
    new Teacher("Harper Lee", ["Computer Science", "Programming"], 18),
];

const groups = [
    new Group("Group1", { "Math": 2, "Physics": 3, "Programming": 4, "Computer Science": 2, }),
    new Group("Group2", { "Computer Science": 3, "Math": 1, "Physics": 2, }),
    new Group("Group3", { "Computer Science": 2, "Programming": 1, "Math": 4, "Physics": 2,}),
    new Group("Group4", { "Computer Science": 1, "Programming": 1, "Physics": 3, "Math": 2 }),
];

function generatePopulation(n_pop) {
    let population = [];
    for (let i = 0; i < n_pop; i++) {
        let schedule = [];
        for (let group of groups) {
            for (let day of days) {
                for (let j = 0; j < 10; j++) {
                    let cell = {};
                    cell["Day"] = day;
                    cell["Lesson"] = (j + 1).toString();
                    cell["Group"] = group;
                    cell["Subject"] = subjects[Math.floor(Math.random() * subjects.length)];
                    cell["Teacher"] = getRandomTeacher(cell["Subject"]);
                    schedule.push(cell);
                }
            }
        }
        population.push(schedule);
    }
    return population;
}

function getRandomTeacher(subject) {
    let eligibleTeachers = teachers.filter(teacher => teacher.subjects.includes(subject));
    if (eligibleTeachers.length > 0) {
        return eligibleTeachers[Math.floor(Math.random() * eligibleTeachers.length)];
    } else {
        return null;
    }
}

function crossover(p1, p2, r_cross) {
    let c1 = [...p1];
    let c2 = [...p2];
    if (Math.random() < r_cross) {
        let pt = Math.floor(Math.random() * (p1.length - 2)) + 1;
        c1 = p1.slice(0, pt).concat(p2.slice(pt));
        c2 = p2.slice(0, pt).concat(p1.slice(pt));
    }
    return [c1, c2];
}

function selection(pop, scores, k = 3) {
    let selectionIx = Math.floor(Math.random() * pop.length);
    for (let i = 0; i < k - 1; i++) {
        let ix = Math.floor(Math.random() * pop.length);
        if (scores[ix] > scores[selectionIx]) {
            selectionIx = ix;
        }
    }
    return pop[selectionIx];
}

function mutation(schedule, r_mut) {
    for (let i = 0; i < schedule.length; i++) {
        if (Math.random() < r_mut) {
            schedule[i]["Subject"] = subjects[Math.floor(Math.random() * subjects.length)];
            schedule[i]["Teacher"] = getRandomTeacher(schedule[i]["Subject"]);
        }
    }
}

function geneticAlgorithm(objective, n_iter, n_pop, r_cross, r_mut) {
    let pop = generatePopulation(n_pop);
    let best = [...pop[0]];
    let bestEval = objective(pop[0]);
    for (let gen = 0; gen < n_iter; gen++) {
        console.log("Gen:", gen);
        let scores = pop.map(c => objective(c));
        for (let i = 0; i < n_pop; i++) {
            if (scores[i] > bestEval) {
                best = [...pop[i]];
                bestEval = scores[i];
                console.log("Current best score:", bestEval);
            }
        }
        let selected = Array.from({ length: n_pop }, () => selection(pop, scores));
        let children = [];
        for (let i = 0; i < n_pop; i += 2) {
            let [p1, p2] = [selected[i], selected[i + 1]];
            let [c1, c2] = crossover(p1, p2, r_cross);
            mutation(c1, r_mut);
            mutation(c2, r_mut);
            children.push(c1, c2);
        }
        pop = [...children];
    }
    return [best, bestEval];
}

function accurate(x) {
    let defGroups = [
        new Group("Group1", { "Math": 2, "Physics": 3, "Chemistry": 3, "English": 2, "Programming": 4, "Literature": 4, "History": 1, "Computer Science": 2, "Geography": 4 }),
        new Group("Group2", { "English": 3, "Literature": 3, "History": 3, "Biology": 2, "Computer Science": 3, "Math": 1, "Physics": 2, "Chemistry": 3 }),
        new Group("Group3", { "Computer Science": 2, "Programming": 1, "Math": 4, "Physics": 2, "Literature": 4, "Geography": 1, "History": 4, "Biology": 2, "Chemistry": 4, "Music": 4 }),
        new Group("Group4", { "Music": 4, "Art": 2, "History": 3, "Computer Science": 1, "Programming": 1, "Biology": 3, "English": 3, "Physics": 3, "Math": 2 }),
    ];
    let defTeachers = {};
    for (let item of x) {
        let group = item["Group"];
        let subject = item["Subject"];
        let teacher = item["Teacher"];
        if (!defGroups[group]) {
            defGroups[group] = {};
        }
        defGroups[group][subject] = (defGroups[group][subject] || 0) + 1;
        if (teacher !== null) {
            if (!defTeachers[teacher]) {
                defTeachers[teacher] = {};
            }
            defTeachers[teacher][subject] = (defTeachers[teacher][subject] || 0) + 1;
        }
    }
    let groups = { ...defGroups };
    let teachers = { ...defTeachers };
    return (teachersAccurate(teachers) + groupsAccurate(groups)) / 2;
}

function teachersAccurate(teachers) {
    let score = 0;
    for (let teacher in teachers) {
        let subjectsHours = teachers[teacher];
        let totalHours = Object.values(subjectsHours).reduce((sum, hours) => sum + hours, 0);
        if (totalHours <= teacher.max_hours) {
            score += 1;
        }
    }
    return score / Object.keys(teachers).length;
}

function groupsAccurate(groups) {
    let totalScore = 0;
    for (let group in groups) {
        let actualSchedule = groups[group];
        let plannedSchedule = groups[group].subjects_hours;
        const vals1 = Object.values(actualSchedule);
        let vals2;
        if (plannedSchedule) vals2 = Object.values(plannedSchedule);
        
        let totalActual = vals1.reduce((sum, hours) => sum + hours, 0);        
        let totalPlanned;
        if (plannedSchedule) totalPlanned = vals2.reduce((sum, hours) => sum + hours, 0);
        let score = 0;
        for (let subject in plannedSchedule) {
            let plannedHours = plannedSchedule[subject];
            if (subject in actualSchedule) {
                let actualHours = actualSchedule[subject];
                score += Math.min(actualHours, plannedHours);
            }
        }
        totalScore += score / Math.max(totalActual, totalPlanned);
    }
    return totalScore / Object.keys(groups).length;
}

function main() {
    const POPULATION_SIZE = 100
    const MUTATION_RATE = 0.1
    const GENERATIONS = 100
    const CROSOVER = 4
    let [best, score] = geneticAlgorithm(accurate, GENERATIONS, POPULATION_SIZE, CROSOVER, MUTATION_RATE);
    console.log('Done!');
    console.log()
    
    const objs = [];
    for (let cell of best) {
        objs.push({
            Day: cell["Day"],
            Lesson: cell["Lesson"],
            Group: JSON.stringify(cell["Group"].group_name),
            Subject: cell["Subject"],
            Teacher: JSON.stringify(cell["Teacher"].name),
        })
    }

    console.table(objs)
}

main();
