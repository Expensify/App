                <RenderHTML
                    html={description}
                    debug={false}
                    style={[styles.textSupporting, styles.textNormal, styles.pre, {maxWidth: '100%'}]}
                />
            </View>
            {shouldShowHorizontalRule && <View style={styles.taskHorizontalRule} />}