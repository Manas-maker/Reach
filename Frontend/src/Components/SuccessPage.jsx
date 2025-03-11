import Header from './Header'
const SuccessPage = () => {
  return (
    <div>
      <Header />
      <h1 className="successfulListing">Listing Created Successfully!</h1>
      <p className="listingParagraph margins">Thank you for reaching!</p>
    </div>
  );
};

export default SuccessPage;