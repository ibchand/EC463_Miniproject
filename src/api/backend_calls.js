import { createFood_table, updateFood_table, deleteFood_table } from "../graphql/mutations";
import { getFood_table, listFood_tables } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

// MUTATIONS
export const createUserData = async values => {
    try {  
        const data = await API.graphql(graphqlOperation(createFood_table, { input: { username: values.username, daily_foods: values.daily_foods, recipes: values.recipes }}));
    } catch (error) {
        console.log("Error creating user data", error);
    }
}

export const updateUserData = async values => {
    try {
        const data = await API.graphql(graphqlOperation(updateFood_table, { input: { username: values.username, daily_foods: values.daily_foods, recipes: values.recipes }}));
    } catch (error) {
        console.log("Error updating user data", error);
    }
}

// QUEURIES

export const getUserData = async idx => {
    try {
        const data = await API.graphql(graphqlOperation(getFood_table, { username: idx }))
        return data;
    } catch (error) {
        console.log("Error getting user data", error);
    }
}

export const listUserData = async idx => {
    try {
        const data = await API.graphql(graphqlOperation(listFood_tables))
        return data;
    } catch (error) {
        console.log("Error getting user data", error);
    }
}