import { createFood_table, updateFood_table, deleteFood_table } from "../graphql/mutations";
import { getFood_table, listFood_tables } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const getUserData = async idx => {
    try {
        const data = await API.graphql(graphqlOperation(getFood_table, { username: idx }))
        return data;
    } catch (error) {
        console.log("Error getting user data", error);
    }
}