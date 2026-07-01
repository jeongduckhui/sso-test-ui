import PageContainer from "../../components/common/PageContainer";

export default function AgGridExampleLayout({ title, description, children }) {
  return (
    <PageContainer title={title} description={description}>
      {children}
    </PageContainer>
  );
}
