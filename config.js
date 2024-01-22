const dbConfig = {
    authentication: {
        options: {
            userName: "lukabrlek",
            password: "Ptica123"
        },
        type: "default"
    },
    server: "food-managment-system.database.windows.net",
    options: {
        database: "FoodManagmentSystemDB",
        encrypt: true
    }
};

module.exports = dbConfig;