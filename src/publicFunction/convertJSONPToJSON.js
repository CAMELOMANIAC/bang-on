const convertJSONPToJSON = (jsonp) => {
	return jsonp.replace(/^[^\(]+\((.*)\)$/, "$1");
};
export default convertJSONPToJSON;
