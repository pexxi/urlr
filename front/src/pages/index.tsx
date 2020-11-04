import React, { useState } from "react";
import { Box, Button, Flex, Heading, Input, InputGroup, InputLeftAddon, Text } from "@chakra-ui/core";
import Layout from "../components/Layout";
import { useForm } from "react-hook-form";

interface FormData {
  url: string;
}

const IndexPage = () => {
  const { register, handleSubmit, errors } = useForm<FormData>({ reValidateMode: "onSubmit" });
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/postNewUrl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: `https://${data.url}` }),
      });
      const success = await response.json();
      const baseUrl = `${window.location.protocol}//${window.location.hostname}${
        window.location.port ? ":" + window.location.port : ""
      }`;
      setShortUrl(`${baseUrl}/${success.slug}`);
    } catch (err) {
      setError(err.message);
      console.error("ERROR: ", err);
    }
  };

  return (
    <Layout title="URLr">
      <Heading as="h1">URLr</Heading>

      <Box py={6}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="row">
            <InputGroup>
              <InputLeftAddon children="https://" />
              <Input
                name="url"
                placeholder="Type your URL here"
                autoComplete="off"
                ref={register({
                  required: "URL missing",
                })}
              />
            </InputGroup>
            <Button type="submit">Go</Button>
          </Flex>
          {errors.url && <Text color="red">{errors.url.message}</Text>}
        </form>
      </Box>

      {shortUrl && (
        <Box py={4}>
          <Heading as="h3">Here's your URL:</Heading>
          <Box>
            <a href={shortUrl}>{shortUrl}</a>
          </Box>
        </Box>
      )}

      <Box pt={4}>
        <div>NOTE: This service is only for testing purposes. Use at your own risk!</div>
      </Box>
    </Layout>
  );
};

export default IndexPage;
