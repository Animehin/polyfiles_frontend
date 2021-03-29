import React from "react";
import { SafeAreaView, TextInput } from "react-native";

const PassInput = () => {
    const [pass, onChangePass] = React.useState("");

    return (
        <SafeAreaView>
            <TextInput style={{
                height: 40,
                borderWidth: 1,
                color: "black",
                backgroundColor: "#D3D3D3",
            }}
                onChangeText={onChangePass}
                value={pass}
                placeholder="Password"
            />
        </SafeAreaView>
    );
};

export default PassInput;
