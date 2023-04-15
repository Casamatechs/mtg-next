import { useRouter } from "next/router";

const CardPage = (props: {
    id: string;
}) => {
  const router = useRouter();
  const { name } = router.query;

  return (
    <>
      <p>Card: {name} - ID: {props.id}</p>
    </>
  );
};

export default CardPage;

export async function getServerSideProps(context: unknown) {
    return {
        props: {
            id: 'Loading'
        },
    }
}
