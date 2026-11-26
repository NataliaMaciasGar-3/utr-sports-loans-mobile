import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ScrollView, Keyboard, TextInput, Dimensions } from "react-native";

const EnsureVisibleContext = createContext(() => { });

// Los campos llaman a esto en su onFocus para quedar visibles sobre el teclado
export const useEnsureVisible = () => useContext(EnsureVisibleContext);

export default function KeyboardAwareScroll({ children, contentContainerStyle, ...props }) {
    const scrollRef = useRef(null);
    const scrollY = useRef(0);
    const keyboardTop = useRef(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const ensureVisible = useCallback(() => {
        const input = TextInput.State.currentlyFocusedInput?.();
        if (!input || keyboardTop.current == null) return;

        input.measureInWindow((x, y, w, h) => {
            const overflow = y + h + 32 - keyboardTop.current;
            if (overflow > 0) {
                scrollRef.current?.scrollTo({ y: scrollY.current + overflow, animated: true });
            }
        });
    }, []);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
            const { height, screenY } = e.endCoordinates;
            keyboardTop.current = screenY ?? Dimensions.get("screen").height - height;
            setKeyboardHeight(height);
            setTimeout(ensureVisible, 80);
        });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            keyboardTop.current = null;
            setKeyboardHeight(0);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [ensureVisible]);

    const handleFieldFocus = useCallback(() => setTimeout(ensureVisible, 120), [ensureVisible]);

    const handleScroll = (e) => {
        scrollY.current = e.nativeEvent.contentOffset.y;
    };

    return (
        <EnsureVisibleContext.Provider value={handleFieldFocus}>
            <ScrollView
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={[contentContainerStyle, { paddingBottom: keyboardHeight }]}
                {...props}
            >
                {children}
            </ScrollView>
        </EnsureVisibleContext.Provider>
    );
}