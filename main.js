import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import Chance from 'chance';

const chanceInstance = new Chance();

chanceInstance.mixin({
    post: () => ({
        id: chanceInstance.integer({ min: 1, max: 10 }),
        title: chanceInstance.sentence()
    })
});

// Fill this in with the schema string
const schemaString = /* GraphQL */`type Author {
    id: Int!
    firstName: String
    lastName: String
    """
    the list of Posts by this author
    """
    posts: [Post]
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }

  # the schema allows the following query:
  type Query {
    posts: [Post]
    author(id: Int!): Author
  }

  # this schema allows the following mutation:
  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }`;

// Make a GraphQL schema with no resolvers
const schema = makeExecutableSchema({ typeDefs: schemaString });

// Create a new schema with mocks
const schemaWithMocks = addMocksToSchema({
    schema,
    mocks:{
        Int: () => chanceInstance.integer({min: 0, max: 100}),
        Float: () => chanceInstance.floating(),
        String: () => chanceInstance.string(),
        Boolean: () => chanceInstance.bool(),
        ID: () => chanceInstance.guid(),
        Post: chanceInstance.n(chanceInstance.post, 3)
    }
});

const app = express();

app.use('/graphql', graphqlHTTP({
    schema: schemaWithMocks,
    graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
