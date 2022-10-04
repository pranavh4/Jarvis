import React from "react";

const RuleContext = React.createContext();

const RuleProvider = (props) => {
    const rules_per_page = 20

    let [rule, setRule] = useState([])
    let [allRules, setAllRules] = useState([])
    let [filterInd, setFilterInd] = useState([])

}