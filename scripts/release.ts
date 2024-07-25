
fetch(`https://api.github.com/repos/${{ github.repository }}/issues \ `)
curl --request POST \
--header 'authorization: Bearer ${{ secrets.GITHUB_TOKEN }}' \
--header 'content-type: application/json' \
--data '{
"title": "Automated issue for commit: ${{ github.sha }}",
"body": "This issue was automatically created by the GitHub Action workflow **${{ github.workflow }}**. \n\n The commit hash was: _${{ github.sha }}_."
}' \
--fail
