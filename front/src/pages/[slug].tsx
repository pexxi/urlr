import React, { useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import useSWR from "swr";
import { useRouter } from "next/router";
import { Progress } from "@chakra-ui/core";

const fetcher = async (url: string) => {
  const res = await window.fetch(url);
  if (!res.ok) {
    const text = await res.text();
    const error = new Error(text);
    throw error;
  }
  return await res.json();
};

const SlugRedirectPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [progressValue, setProgressValue] = useState(0);

  const { data, error } = useSWR<{ url: string; slug: string }>(
    slug ? `${process.env.NEXT_PUBLIC_API_URL}/getUrl?slug=${slug}` : null,
    fetcher,
    { shouldRetryOnError: false },
  );

  if (error) {
    console.log(error.message);
    return <div>{error.message}</div>;
  }

  if (!slug) {
    return <div>Loading...</div>;
  }

  if (!data?.url) {
    return <div>Not found</div>;
  }

  setInterval(() => {
    setProgressValue(progressValue + 20);
  }, 950);

  setTimeout(() => {
    window.location.href = data.url;
  }, 5000);

  return (
    <Layout title="Redirecting...">
      <h1>URLr</h1>
      <h1>Redirecting...</h1>
      <p>{`Redirecting you to ${data.url}`}</p>
      <div>
        <Progress color="green" hasStripe isAnimated value={progressValue} />
      </div>
      <p>
        <Link href={data.url}>
          <a>Click here if you don't want to wait</a>
        </Link>
      </p>
      <p>Thanks for using URLr.</p>
    </Layout>
  );
};

export default SlugRedirectPage;
